package com.arstore.seed;

import com.arstore.entity.Collection;
import com.arstore.entity.Product;
import com.arstore.entity.Role;
import com.arstore.entity.User;
import com.arstore.repository.CartRepository;
import com.arstore.repository.CollectionRepository;
import com.arstore.repository.ProductRepository;
import com.arstore.repository.UserRepository;
import com.arstore.entity.Cart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

/**
 * One-off catalog seeder that parses the legacy PHP app's products.xml and
 * loads matching Collection + Product rows, plus a seed ADMIN user, so the
 * new backend has real data on first run. Only active under the "seed"
 * Spring profile - never runs in normal dev/prod startup.
 *
 * Legacy quirk being reproduced deliberately: the legacy XML has two
 * "virtual" collections, id="featured" and id="latest", which exist purely
 * to render homepage sections and whose <product> entries are DUPLICATES of
 * products that already live under a real collection (cross-referenced via
 * a nested <collection>realCollectionId</collection> tag). We do not create
 * new Product rows for those duplicates; instead we look up the matching
 * real product (matched by image filename, case-insensitively, within the
 * referenced real collection - the most reliable join key available in the
 * source data, since names/ids are not consistently reused) and flip its
 * "featured" flag to true. If the cross-reference points at a collection id
 * that isn't a real collection in the file, or no matching product image is
 * found in that collection, the reference is simply skipped, per spec.
 */
@Component
@Profile("seed")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final Set<String> VIRTUAL_COLLECTION_IDS = Set.of("featured", "latest");
    private static final String SEED_ADMIN_PASSWORD = "ChangeMe123!"; // see README for how to rotate this

    private final CollectionRepository collectionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final String xmlLocation;
    private final ResourceLoader resourceLoader = new DefaultResourceLoader();

    public DataSeeder(CollectionRepository collectionRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository,
                       CartRepository cartRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.seed.products-xml-path:classpath:seed/products.xml}") String xmlLocation) {
        this.collectionRepository = collectionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.xmlLocation = xmlLocation;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();

        if (!collectionRepository.findAll().isEmpty()) {
            log.info("Catalog already has data - skipping product XML seed.");
            return;
        }

        Resource resource = resourceLoader.getResource(xmlLocation);
        if (!resource.exists()) {
            log.warn("Seed XML not found at {}, skipping catalog seed.", xmlLocation);
            return;
        }

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc;
        try (InputStream in = resource.getInputStream()) {
            doc = builder.parse(in);
        }
        doc.getDocumentElement().normalize();

        // IMPORTANT: use only direct children of the <collections> root, not
        // getElementsByTagName("collection") - that would also match the
        // nested <collection>realCollectionId</collection> cross-reference
        // tags inside featured/latest <product> entries, which share the
        // same element name but mean something completely different.
        List<Element> collectionNodes = directChildElements(doc.getDocumentElement(), "collection");

        // Pass 1: real (non-virtual) collections and their genuine products.
        Set<String> realCollectionIds = new HashSet<>();
        // imageBasename -> Product, scoped per collection id, for the featured/latest join in pass 2.
        Map<String, Map<String, Product>> productsByCollectionAndImage = new HashMap<>();

        for (int i = 0; i < collectionNodes.size(); i++) {
            Element collectionEl = collectionNodes.get(i);
            String id = collectionEl.getAttribute("id");
            if (VIRTUAL_COLLECTION_IDS.contains(id)) {
                continue;
            }
            String name = collectionEl.getAttribute("name");
            String image = normalizeImagePath(childText(collectionEl, "image"));

            Collection collection = new Collection(id, name, image);
            collectionRepository.save(collection);
            realCollectionIds.add(id);

            Map<String, Product> byImage = new HashMap<>();
            productsByCollectionAndImage.put(id, byImage);

            NodeList productNodes = collectionEl.getElementsByTagName("product");
            for (int j = 0; j < productNodes.getLength(); j++) {
                Element productEl = (Element) productNodes.item(j);
                Product product = buildProduct(collection, productEl);
                Product saved = productRepository.save(product);

                String imageKey = basenameKey(product.getImageUrl());
                if (imageKey != null) {
                    byImage.putIfAbsent(imageKey, saved);
                }
            }
        }

        // Pass 2: featured/latest virtual collections - mark matching real products as featured.
        int featuredMarked = 0;
        int skippedDangling = 0;
        for (int i = 0; i < collectionNodes.size(); i++) {
            Element collectionEl = collectionNodes.get(i);
            String id = collectionEl.getAttribute("id");
            if (!VIRTUAL_COLLECTION_IDS.contains(id)) {
                continue;
            }

            NodeList productNodes = collectionEl.getElementsByTagName("product");
            for (int j = 0; j < productNodes.getLength(); j++) {
                Element productEl = (Element) productNodes.item(j);
                String refCollectionId = childText(productEl, "collection");
                if (refCollectionId == null || refCollectionId.isBlank()) {
                    continue;
                }
                if (!realCollectionIds.contains(refCollectionId)) {
                    // Cross-reference points at a collection id that doesn't
                    // exist as a real collection in the file - skip.
                    skippedDangling++;
                    continue;
                }
                String imageKey = basenameKey(childText(productEl, "image"));
                Map<String, Product> byImage = productsByCollectionAndImage.get(refCollectionId);
                Product match = (imageKey != null && byImage != null) ? byImage.get(imageKey) : null;
                if (match == null) {
                    skippedDangling++;
                    continue;
                }
                match.setFeatured(true);
                productRepository.save(match);
                featuredMarked++;
            }
        }

        log.info("Catalog seed complete: {} collections, {} products, {} marked featured, {} dangling references skipped.",
                realCollectionIds.size(), productRepository.count(), featuredMarked, skippedDangling);
    }

    private void seedAdmin() {
        if (userRepository.existsByUsernameIgnoreCase("admin")) {
            return;
        }
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@arstore.local");
        admin.setPasswordHash(passwordEncoder.encode(SEED_ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setVerified(true);
        userRepository.save(admin);

        Cart cart = new Cart();
        cart.setUser(admin);
        cartRepository.save(cart);

        log.info("Seeded admin user 'admin' with placeholder password '{}' - see README to change it.", SEED_ADMIN_PASSWORD);
    }

    private Product buildProduct(Collection collection, Element productEl) {
        Product product = new Product();
        product.setCollection(collection);
        product.setName(childText(productEl, "name"));
        product.setImageUrl(normalizeImagePath(childText(productEl, "image")));
        product.setPrice(parsePrice(childText(productEl, "price")));
        product.setStock(parseInt(childText(productEl, "stock"), 0));
        product.setRating(parseIntOrNull(childText(productEl, "rating")));
        product.setExternalUrl(childText(productEl, "url"));
        product.setFeatured(false);
        return product;
    }

    private BigDecimal parsePrice(String text) {
        if (text == null || text.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(text.trim());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private int parseInt(String text, int fallback) {
        if (text == null || text.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(text.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private Integer parseIntOrNull(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(text.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** Returns the direct child elements of {@code parent} with the given tag name (non-recursive). */
    private List<Element> directChildElements(Element parent, String tagName) {
        List<Element> result = new ArrayList<>();
        NodeList children = parent.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE && node.getNodeName().equals(tagName)) {
                result.add((Element) node);
            }
        }
        return result;
    }

    /** Returns the direct child element's text content, or null if absent/blank. */
    private String childText(Element parent, String tagName) {
        NodeList children = parent.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE && node.getNodeName().equals(tagName)) {
                String text = node.getTextContent();
                return (text == null || text.isBlank()) ? null : text.trim();
            }
        }
        return null;
    }

    /**
     * Normalizes a legacy image reference (bare filename or "../uploads/x.png")
     * to a "/uploads/<filename>" path served as a static asset by the new
     * frontend (see frontend/public/uploads, copied verbatim from the legacy
     * uploads/ folder).
     */
    private String normalizeImagePath(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return null;
        }
        String normalized = imagePath.replace('\\', '/');
        int idx = normalized.lastIndexOf('/');
        String base = idx >= 0 ? normalized.substring(idx + 1) : normalized;
        return "/uploads/" + base;
    }

    /** Normalizes an (possibly path-prefixed) image reference to a lowercase basename for joining. */
    private String basenameKey(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return null;
        }
        String normalized = imagePath.replace('\\', '/');
        int idx = normalized.lastIndexOf('/');
        String base = idx >= 0 ? normalized.substring(idx + 1) : normalized;
        return base.toLowerCase(Locale.ROOT);
    }
}

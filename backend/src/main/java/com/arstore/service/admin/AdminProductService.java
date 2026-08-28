package com.arstore.service.admin;

import com.arstore.dto.ProductResponse;
import com.arstore.dto.admin.ProductUpsertRequest;
import com.arstore.entity.CartItem;
import com.arstore.entity.Collection;
import com.arstore.entity.Product;
import com.arstore.exception.ApiException;
import com.arstore.repository.CartItemRepository;
import com.arstore.repository.CollectionRepository;
import com.arstore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CollectionRepository collectionRepository;
    private final CartItemRepository cartItemRepository;

    public AdminProductService(ProductRepository productRepository,
                                CollectionRepository collectionRepository,
                                CartItemRepository cartItemRepository) {
        this.productRepository = productRepository;
        this.collectionRepository = collectionRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    @Transactional
    public ProductResponse create(ProductUpsertRequest request) {
        Collection collection = collectionRepository.findById(request.collectionId())
                .orElseThrow(() -> ApiException.notFound("Collection not found: " + request.collectionId()));

        Product product = new Product();
        applyRequest(product, request, collection);
        return ProductResponse.from(productRepository.save(product));
    }

    /**
     * Updates a product and, per an intentional legacy business rule carried
     * over from the PHP app, refreshes the name/price snapshot on any
     * CartItem currently referencing this product so in-cart totals stay in
     * sync with catalog edits (rather than showing stale prices until the
     * shopper re-adds the item).
     */
    @Transactional
    public ProductResponse update(Long id, ProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + id));
        Collection collection = collectionRepository.findById(request.collectionId())
                .orElseThrow(() -> ApiException.notFound("Collection not found: " + request.collectionId()));

        applyRequest(product, request, collection);
        Product saved = productRepository.save(product);

        List<CartItem> affected = cartItemRepository.findByProduct(saved);
        for (CartItem item : affected) {
            item.setNameSnapshot(saved.getName());
            item.setPriceSnapshot(saved.getPrice());
        }
        cartItemRepository.saveAll(affected);

        return ProductResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + id));
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductUpsertRequest request, Collection collection) {
        product.setCollection(collection);
        product.setName(request.name());
        product.setImageUrl(request.imageUrl());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setRating(request.rating());
        product.setFeatured(request.featured());
        product.setSizes(request.sizes());
        product.setColors(request.colors());
    }
}

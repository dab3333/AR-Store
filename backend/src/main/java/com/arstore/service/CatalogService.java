package com.arstore.service;

import com.arstore.dto.CollectionResponse;
import com.arstore.dto.ProductResponse;
import com.arstore.entity.Product;
import com.arstore.exception.ApiException;
import com.arstore.repository.CollectionRepository;
import com.arstore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CollectionRepository collectionRepository;
    private final ProductRepository productRepository;

    public CatalogService(CollectionRepository collectionRepository, ProductRepository productRepository) {
        this.collectionRepository = collectionRepository;
        this.productRepository = productRepository;
    }

    public List<CollectionResponse> listCollections() {
        return collectionRepository.findAll().stream().map(CollectionResponse::from).toList();
    }

    public CollectionResponse getCollection(String id) {
        return collectionRepository.findById(id)
                .map(CollectionResponse::from)
                .orElseThrow(() -> ApiException.notFound("Collection not found: " + id));
    }

    public List<ProductResponse> listProducts(String collectionId, Boolean featured) {
        List<Product> products;
        if (collectionId != null && featured != null) {
            products = featured
                    ? productRepository.findByCollectionIdAndFeaturedTrue(collectionId)
                    : productRepository.findByCollectionId(collectionId).stream().filter(p -> !p.isFeatured()).toList();
        } else if (collectionId != null) {
            products = productRepository.findByCollectionId(collectionId);
        } else if (featured != null && featured) {
            products = productRepository.findByFeaturedTrue();
        } else {
            products = productRepository.findAll();
        }
        return products.stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getProduct(Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + id));
    }

    public List<ProductResponse> search(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return productRepository.search(q.trim()).stream().map(ProductResponse::from).toList();
    }
}

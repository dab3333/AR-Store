package com.arstore.dto;

import com.arstore.entity.Product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String collectionId,
        String collectionName,
        String name,
        String imageUrl,
        BigDecimal price,
        int stock,
        Integer rating,
        String externalUrl,
        boolean featured
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getCollection().getId(),
                p.getCollection().getName(),
                p.getName(),
                p.getImageUrl(),
                p.getPrice(),
                p.getStock(),
                p.getRating(),
                p.getExternalUrl(),
                p.isFeatured()
        );
    }
}

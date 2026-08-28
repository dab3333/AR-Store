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
        boolean featured,
        String sizes,
        String colors
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
                p.isFeatured(),
                p.getSizes(),
                p.getColors()
        );
    }
}

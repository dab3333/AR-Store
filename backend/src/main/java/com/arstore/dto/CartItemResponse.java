package com.arstore.dto;

import com.arstore.entity.CartItem;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String name,
        String imageUrl,
        BigDecimal price,
        int qty,
        BigDecimal lineTotal,
        int availableStock
) {
    public static CartItemResponse from(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getNameSnapshot(),
                item.getProduct().getImageUrl(),
                item.getPriceSnapshot(),
                item.getQty(),
                item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQty())),
                item.getProduct().getStock()
        );
    }
}

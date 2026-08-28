package com.arstore.dto;

import com.arstore.entity.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String name,
        BigDecimal price,
        int qty,
        String size,
        String color,
        BigDecimal lineTotal
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getProduct() != null ? item.getProduct().getId() : null,
                item.getNameSnapshot(),
                item.getPriceSnapshot(),
                item.getQty(),
                item.getSize(),
                item.getColor(),
                item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQty()))
        );
    }
}

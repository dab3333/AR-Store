package com.arstore.dto;

import com.arstore.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        Long userId,
        String username,
        LocalDateTime createdAt,
        BigDecimal total,
        String status,
        List<OrderItemResponse> items
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getUsername(),
                order.getCreatedAt(),
                order.getTotal(),
                order.getStatus().name(),
                order.getItems().stream().map(OrderItemResponse::from).toList()
        );
    }
}

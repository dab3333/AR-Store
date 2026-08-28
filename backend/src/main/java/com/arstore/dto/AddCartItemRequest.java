package com.arstore.dto;

import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotNull Long productId,
        String size,
        String color,
        Integer qty
) {
}

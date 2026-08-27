package com.arstore.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateCartItemRequest(
        @NotNull Integer change
) {
}

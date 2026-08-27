package com.arstore.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductUpsertRequest(
        @NotBlank String collectionId,
        @NotBlank String name,
        String imageUrl,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal price,
        @Min(0) int stock,
        Integer rating,
        String externalUrl,
        boolean featured
) {
}

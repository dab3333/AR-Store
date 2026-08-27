package com.arstore.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record CollectionUpsertRequest(
        @NotBlank String id,
        @NotBlank String name,
        String imageUrl
) {
}

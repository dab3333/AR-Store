package com.arstore.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record CollectionUpsertRequest(
        String id,
        @NotBlank String name,
        String imageUrl
) {
}

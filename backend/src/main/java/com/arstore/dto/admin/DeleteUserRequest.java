package com.arstore.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record DeleteUserRequest(
        @NotBlank String adminPassword
) {
}

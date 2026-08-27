package com.arstore.dto.admin;

import com.arstore.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        String address,
        String contact,
        String role,
        boolean verified,
        LocalDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getUsername(), u.getEmail(), u.getAddress(), u.getContact(),
                u.getRole().name(), u.isVerified(), u.getCreatedAt()
        );
    }
}

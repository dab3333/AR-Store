package com.arstore.dto;

import com.arstore.entity.Collection;

public record CollectionResponse(String id, String name, String imageUrl) {
    public static CollectionResponse from(Collection c) {
        return new CollectionResponse(c.getId(), c.getName(), c.getImageUrl());
    }
}

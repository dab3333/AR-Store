package com.arstore.service.admin;

import com.arstore.dto.CollectionResponse;
import com.arstore.dto.admin.CollectionUpsertRequest;
import com.arstore.entity.Collection;
import com.arstore.exception.ApiException;
import com.arstore.repository.CollectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminCollectionService {

    private final CollectionRepository collectionRepository;

    public AdminCollectionService(CollectionRepository collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    @Transactional(readOnly = true)
    public List<CollectionResponse> list() {
        return collectionRepository.findAll().stream().map(CollectionResponse::from).toList();
    }

    @Transactional
    public CollectionResponse create(CollectionUpsertRequest request) {
        String id = (request.id() == null || request.id().isBlank())
                ? "col" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12)
                : request.id();
        if (collectionRepository.existsById(id)) {
            throw ApiException.conflict("Collection already exists: " + id);
        }
        Collection collection = new Collection(id, request.name(), request.imageUrl());
        return CollectionResponse.from(collectionRepository.save(collection));
    }

    @Transactional
    public CollectionResponse update(String id, CollectionUpsertRequest request) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Collection not found: " + id));
        collection.setName(request.name());
        collection.setImageUrl(request.imageUrl());
        return CollectionResponse.from(collectionRepository.save(collection));
    }

    @Transactional
    public void delete(String id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Collection not found: " + id));
        // ON DELETE CASCADE at the DB level removes its products (and their
        // dependent cart/order item rows resolve independently of this call).
        collectionRepository.delete(collection);
    }
}

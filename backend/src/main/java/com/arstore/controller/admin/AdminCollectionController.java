package com.arstore.controller.admin;

import com.arstore.dto.CollectionResponse;
import com.arstore.dto.admin.CollectionUpsertRequest;
import com.arstore.service.admin.AdminCollectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/collections")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCollectionController {

    private final AdminCollectionService adminCollectionService;

    public AdminCollectionController(AdminCollectionService adminCollectionService) {
        this.adminCollectionService = adminCollectionService;
    }

    @GetMapping
    public List<CollectionResponse> list() {
        return adminCollectionService.list();
    }

    @PostMapping
    public ResponseEntity<CollectionResponse> create(@Valid @RequestBody CollectionUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCollectionService.create(request));
    }

    @PutMapping("/{id}")
    public CollectionResponse update(@PathVariable String id, @Valid @RequestBody CollectionUpsertRequest request) {
        return adminCollectionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        adminCollectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

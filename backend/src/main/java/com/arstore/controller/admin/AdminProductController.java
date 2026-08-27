package com.arstore.controller.admin;

import com.arstore.dto.ProductResponse;
import com.arstore.dto.admin.ProductUpsertRequest;
import com.arstore.service.admin.AdminProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public List<ProductResponse> list() {
        return adminProductService.list();
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.create(request));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpsertRequest request) {
        return adminProductService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminProductService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

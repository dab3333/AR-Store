package com.arstore.controller;

import com.arstore.dto.CollectionResponse;
import com.arstore.dto.ProductResponse;
import com.arstore.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/collections")
    public List<CollectionResponse> listCollections() {
        return catalogService.listCollections();
    }

    @GetMapping("/collections/{id}")
    public CollectionResponse getCollection(@PathVariable String id) {
        return catalogService.getCollection(id);
    }

    @GetMapping("/products")
    public List<ProductResponse> listProducts(@RequestParam(required = false) String collectionId,
                                               @RequestParam(required = false) Boolean featured) {
        return catalogService.listProducts(collectionId, featured);
    }

    @GetMapping("/products/search")
    public List<ProductResponse> search(@RequestParam String q) {
        return catalogService.search(q);
    }

    @GetMapping("/products/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return catalogService.getProduct(id);
    }
}

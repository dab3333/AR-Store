package com.arstore.controller;

import com.arstore.dto.AddCartItemRequest;
import com.arstore.dto.CartResponse;
import com.arstore.dto.UpdateCartItemRequest;
import com.arstore.security.UserPrincipal;
import com.arstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.getCart(principal.getId());
    }

    @PostMapping("/items")
    public CartResponse addItem(@AuthenticationPrincipal UserPrincipal principal,
                                 @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(principal.getId(), request.productId(), request.size(), request.color(), request.qty());
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse updateItem(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long itemId,
                                    @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(principal.getId(), itemId, request.change());
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long itemId) {
        return cartService.removeItem(principal.getId(), itemId);
    }
}

package com.arstore.controller;

import com.arstore.dto.OrderResponse;
import com.arstore.security.UserPrincipal;
import com.arstore.service.CheckoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> checkout(@AuthenticationPrincipal UserPrincipal principal) {
        OrderResponse order = checkoutService.checkout(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}

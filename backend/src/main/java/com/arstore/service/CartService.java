package com.arstore.service;

import com.arstore.dto.CartItemResponse;
import com.arstore.dto.CartResponse;
import com.arstore.entity.Cart;
import com.arstore.entity.CartItem;
import com.arstore.entity.Product;
import com.arstore.entity.User;
import com.arstore.exception.ApiException;
import com.arstore.repository.CartItemRepository;
import com.arstore.repository.CartRepository;
import com.arstore.repository.ProductRepository;
import com.arstore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + productId));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);
        if (item != null) {
            if (item.getQty() + 1 > product.getStock()) {
                throw ApiException.badRequest("Not enough stock for " + product.getName());
            }
            item.setQty(item.getQty() + 1);
        } else {
            if (product.getStock() < 1) {
                throw ApiException.badRequest("Not enough stock for " + product.getName());
            }
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setNameSnapshot(product.getName());
            item.setPriceSnapshot(product.getPrice());
            item.setQty(1);
            cart.getItems().add(item);
        }
        cartItemRepository.save(item);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long productId, int change) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + productId));
        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> ApiException.notFound("Item not in cart: " + productId));

        int newQty = item.getQty() + change;
        if (newQty > product.getStock()) {
            throw ApiException.badRequest("Not enough stock for " + product.getName());
        }
        if (newQty < 1) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQty(newQty);
            cartItemRepository.save(item);
        }
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + productId));
        cartItemRepository.findByCartAndProduct(cart, product).ifPresent(item -> {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        });
        return toResponse(cart);
    }

    private CartResponse toResponse(Cart cart) {
        var items = cartItemRepository.findByCart(cart).stream().map(CartItemResponse::from).toList();
        BigDecimal total = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(items, total);
    }
}

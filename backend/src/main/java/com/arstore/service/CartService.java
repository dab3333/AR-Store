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
    public CartResponse addItem(Long userId, Long productId, String requestedSize, String requestedColor, Integer requestedQty) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Product not found: " + productId));

        String size = resolveOption(requestedSize, product.getSizes());
        String color = resolveOption(requestedColor, product.getColors());
        int addQty = (requestedQty == null || requestedQty < 1) ? 1 : requestedQty;

        CartItem item = cartItemRepository.findByCartAndProductAndSizeAndColor(cart, product, size, color).orElse(null);
        if (item != null) {
            if (item.getQty() + addQty > product.getStock()) {
                throw ApiException.badRequest("Not enough stock for " + product.getName());
            }
            item.setQty(item.getQty() + addQty);
        } else {
            if (product.getStock() < addQty) {
                throw ApiException.badRequest("Not enough stock for " + product.getName());
            }
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setNameSnapshot(product.getName());
            item.setPriceSnapshot(product.getPrice());
            item.setQty(addQty);
            item.setSize(size);
            item.setColor(color);
            cart.getItems().add(item);
        }
        cartItemRepository.save(item);
        return toResponse(cart);
    }

    /** Falls back to the product's first listed option when the caller didn't select one. */
    private String resolveOption(String requested, String available) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        if (available == null || available.isBlank()) {
            return "";
        }
        return available.split(",")[0].trim();
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, int change) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartAndId(cart, itemId)
                .orElseThrow(() -> ApiException.notFound("Item not in cart: " + itemId));
        Product product = item.getProduct();

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
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.findByCartAndId(cart, itemId).ifPresent(item -> {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        });
        return toResponse(cart);
    }

    private CartResponse toResponse(Cart cart) {
        var items = cartItemRepository.findByCartOrderByIdAsc(cart).stream().map(CartItemResponse::from).toList();
        BigDecimal total = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(items, total);
    }
}

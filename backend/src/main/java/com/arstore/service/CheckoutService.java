package com.arstore.service;

import com.arstore.dto.OrderResponse;
import com.arstore.entity.*;
import com.arstore.exception.ApiException;
import com.arstore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CheckoutService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public CheckoutService(CartRepository cartRepository,
                            CartItemRepository cartItemRepository,
                            ProductRepository productRepository,
                            OrderRepository orderRepository,
                            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    /**
     * Single transactional checkout: validates every cart line against live
     * stock BEFORE mutating anything. If any line is insufficient, the whole
     * operation aborts with a 400 naming the offending product and nothing is
     * written (no partial stock decrements, no partial order).
     */
    @Transactional
    public OrderResponse checkout(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> ApiException.badRequest("Cart is empty"));

        List<CartItem> items = cartItemRepository.findByCartOrderByIdAsc(cart);
        if (items.isEmpty()) {
            throw ApiException.badRequest("Cart is empty");
        }

        // Validation pass first - abort before any write if anything is invalid.
        for (CartItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> ApiException.badRequest(
                            "Product no longer exists: " + item.getNameSnapshot()));
            if (product.getStock() < item.getQty()) {
                throw ApiException.badRequest(
                        "Insufficient stock for " + product.getName()
                                + " (requested " + item.getQty() + ", available " + product.getStock() + ")");
            }
        }

        // Mutation pass - safe now that every line has been validated.
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PAID);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> ApiException.badRequest("Product no longer exists: " + item.getNameSnapshot()));

            product.setStock(product.getStock() - item.getQty());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setNameSnapshot(item.getNameSnapshot());
            orderItem.setPriceSnapshot(item.getPriceSnapshot());
            orderItem.setQty(item.getQty());
            orderItem.setSize(item.getSize());
            orderItem.setColor(item.getColor());
            order.getItems().add(orderItem);

            total = total.add(item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQty())));
        }
        order.setTotal(total);
        orderRepository.save(order);

        cart.getItems().clear();
        cartItemRepository.deleteAll(items);

        return OrderResponse.from(order);
    }
}

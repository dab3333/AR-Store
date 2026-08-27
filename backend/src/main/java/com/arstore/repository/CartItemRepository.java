package com.arstore.repository;

import com.arstore.entity.Cart;
import com.arstore.entity.CartItem;
import com.arstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    List<CartItem> findByProduct(Product product);

    List<CartItem> findByCart(Cart cart);
}

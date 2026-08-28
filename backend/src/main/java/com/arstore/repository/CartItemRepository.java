package com.arstore.repository;

import com.arstore.entity.Cart;
import com.arstore.entity.CartItem;
import com.arstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProductAndSizeAndColor(Cart cart, Product product, String size, String color);

    Optional<CartItem> findByCartAndId(Cart cart, Long id);

    List<CartItem> findByProduct(Product product);

    List<CartItem> findByCartOrderByIdAsc(Cart cart);
}

package com.arstore.service;

import com.arstore.dto.CartResponse;
import com.arstore.entity.*;
import com.arstore.exception.ApiException;
import com.arstore.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    private CartService cartService;

    private User user;
    private Cart cart;
    private Product product;
    private CartItem item;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartRepository, cartItemRepository, productRepository, userRepository);

        user = new User();
        user.setId(1L);

        cart = new Cart();
        cart.setId(10L);
        cart.setUser(user);
        cart.setItems(new ArrayList<>());

        Collection collection = new Collection("dota", "DOTA Collection", null);
        product = new Product();
        product.setId(100L);
        product.setName("Lion Shirt");
        product.setPrice(new BigDecimal("245.00"));
        product.setStock(5);
        product.setCollection(collection);

        item = new CartItem();
        item.setId(1000L);
        item.setCart(cart);
        item.setProduct(product);
        item.setNameSnapshot(product.getName());
        item.setPriceSnapshot(product.getPrice());
        item.setQty(3);
        cart.getItems().add(item);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        lenient().when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        lenient().when(cartItemRepository.findByCartAndId(cart, 1000L)).thenReturn(Optional.of(item));
        lenient().when(cartItemRepository.findByCartAndProductAndSizeAndColor(cart, product, "", ""))
                .thenReturn(Optional.of(item));
        lenient().when(cartItemRepository.findByCartOrderByIdAsc(cart)).thenAnswer(inv -> List.copyOf(cart.getItems()));
    }

    @Test
    void increasingQuantityWithinStockSucceeds() {
        CartResponse response = cartService.updateItem(1L, 1000L, 1); // 3 -> 4, stock is 5
        assertEquals(4, item.getQty());
        assertEquals(1, response.items().size());
    }

    @Test
    void increasingQuantityBeyondStockIsRejected() {
        // qty 3 + change 3 = 6, but only 5 in stock
        ApiException ex = assertThrows(ApiException.class, () -> cartService.updateItem(1L, 1000L, 3));
        assertTrue(ex.getMessage().toLowerCase().contains("stock"));
        assertEquals(3, item.getQty(), "quantity must be unchanged after a rejected update");
    }

    @Test
    void decreasingQuantityToZeroRemovesTheItem() {
        cartService.updateItem(1L, 1000L, -3); // 3 -> 0
        verify(cartItemRepository).delete(item);
        assertFalse(cart.getItems().contains(item));
    }

    @Test
    void decreasingQuantityBelowZeroAlsoRemovesTheItem() {
        cartService.updateItem(1L, 1000L, -10); // 3 -> -7, treated as removal
        verify(cartItemRepository).delete(item);
    }

    @Test
    void addingAnItemAlreadyAtStockLimitIsRejected() {
        product.setStock(3); // exactly matches current qty
        ApiException ex = assertThrows(ApiException.class, () -> cartService.addItem(1L, 100L, null, null, null));
        assertTrue(ex.getMessage().toLowerCase().contains("stock"));
    }
}

package com.arstore.service;

import com.arstore.dto.OrderResponse;
import com.arstore.entity.*;
import com.arstore.exception.ApiException;
import com.arstore.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;

    private CheckoutService checkoutService;

    private User user;
    private Cart cart;

    @BeforeEach
    void setUp() {
        checkoutService = new CheckoutService(cartRepository, cartItemRepository, productRepository, orderRepository, userRepository);

        user = new User();
        user.setId(1L);
        user.setUsername("shopper");

        cart = new Cart();
        cart.setId(10L);
        cart.setUser(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
    }

    private Product product(Long id, String name, int stock, String price) {
        Collection collection = new Collection("dota", "DOTA Collection", null);
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setStock(stock);
        p.setPrice(new BigDecimal(price));
        p.setCollection(collection);
        return p;
    }

    private CartItem cartItem(Cart cart, Product product, int qty) {
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setNameSnapshot(product.getName());
        item.setPriceSnapshot(product.getPrice());
        item.setQty(qty);
        return item;
    }

    @Test
    void checkoutDecrementsStockAndComputesTotalWhenEverythingIsAvailable() {
        Product lion = product(1L, "Lion Shirt", 10, "245.00");
        Product zeus = product(2L, "Zeus Shirt", 5, "245.00");
        CartItem item1 = cartItem(cart, lion, 2);
        CartItem item2 = cartItem(cart, zeus, 1);

        when(cartItemRepository.findByCart(cart)).thenReturn(List.of(item1, item2));
        when(productRepository.findById(1L)).thenReturn(Optional.of(lion));
        when(productRepository.findById(2L)).thenReturn(Optional.of(zeus));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = checkoutService.checkout(1L);

        assertEquals(0, new BigDecimal("735.00").compareTo(response.total())); // 2*245 + 1*245
        assertEquals(8, lion.getStock());
        assertEquals(4, zeus.getStock());
        verify(productRepository).save(lion);
        verify(productRepository).save(zeus);
        verify(cartItemRepository).deleteAll(List.of(item1, item2));
    }

    @Test
    void checkoutRejectsWhenAnyLineExceedsAvailableStock() {
        Product lion = product(1L, "Lion Shirt", 1, "245.00"); // only 1 in stock
        Product zeus = product(2L, "Zeus Shirt", 5, "245.00");
        CartItem item1 = cartItem(cart, lion, 2); // wants 2, only 1 available
        CartItem item2 = cartItem(cart, zeus, 1);

        when(cartItemRepository.findByCart(cart)).thenReturn(List.of(item1, item2));
        when(productRepository.findById(1L)).thenReturn(Optional.of(lion));
        lenient().when(productRepository.findById(2L)).thenReturn(Optional.of(zeus));

        ApiException ex = assertThrows(ApiException.class, () -> checkoutService.checkout(1L));
        assertTrue(ex.getMessage().contains("Lion Shirt"));

        // No partial writes: stock untouched, nothing saved/persisted.
        assertEquals(1, lion.getStock());
        assertEquals(5, zeus.getStock());
        verify(productRepository, never()).save(any());
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteAll(any());
    }

    @Test
    void checkoutRollsBackFullyWhenAFailureOccursMidCartValidation() {
        // First item is fine, second (later in iteration) is short on stock -
        // the validation pass must catch it before ANY mutation happens to
        // the first item, proving there's no partial-order side effect.
        Product lion = product(1L, "Lion Shirt", 10, "245.00");
        Product zeus = product(2L, "Zeus Shirt", 0, "245.00"); // out of stock
        CartItem item1 = cartItem(cart, lion, 2);
        CartItem item2 = cartItem(cart, zeus, 1);

        when(cartItemRepository.findByCart(cart)).thenReturn(List.of(item1, item2));
        when(productRepository.findById(1L)).thenReturn(Optional.of(lion));
        when(productRepository.findById(2L)).thenReturn(Optional.of(zeus));

        assertThrows(ApiException.class, () -> checkoutService.checkout(1L));

        assertEquals(10, lion.getStock(), "lion stock must be untouched since checkout aborted before the mutation pass");
        assertEquals(0, zeus.getStock());
        verify(productRepository, never()).save(any());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkoutRejectsWhenCartIsEmpty() {
        when(cartItemRepository.findByCart(cart)).thenReturn(List.of());
        ApiException ex = assertThrows(ApiException.class, () -> checkoutService.checkout(1L));
        assertTrue(ex.getMessage().toLowerCase().contains("empty"));
    }
}

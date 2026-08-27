package com.arstore.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "name_snapshot", nullable = false)
    private String nameSnapshot;

    @Column(name = "price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceSnapshot;

    @Column(nullable = false)
    private int qty;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getNameSnapshot() { return nameSnapshot; }
    public void setNameSnapshot(String nameSnapshot) { this.nameSnapshot = nameSnapshot; }

    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
    public void setPriceSnapshot(BigDecimal priceSnapshot) { this.priceSnapshot = priceSnapshot; }

    public int getQty() { return qty; }
    public void setQty(int qty) { this.qty = qty; }
}

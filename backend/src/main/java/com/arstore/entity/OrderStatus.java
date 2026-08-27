package com.arstore.entity;

/**
 * Order lifecycle status. Only PAID is produced today (checkout is
 * synchronous and only succeeds once payment/stock has been confirmed),
 * but the enum is deliberately open-ended so states such as SHIPPED,
 * CANCELLED, or REFUNDED can be added later without touching the schema
 * (the column is a VARCHAR, not a Postgres native enum).
 */
public enum OrderStatus {
    PAID
}

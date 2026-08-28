ALTER TABLE cart_items DROP CONSTRAINT uq_cart_items_cart_product;
ALTER TABLE cart_items ADD CONSTRAINT uq_cart_items_cart_product_variant UNIQUE (cart_id, product_id, size, color);

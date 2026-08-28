ALTER TABLE products ADD COLUMN sizes VARCHAR(200);
ALTER TABLE products ADD COLUMN colors VARCHAR(200);

UPDATE products SET sizes = 'S,M,L,XL' WHERE sizes IS NULL;
UPDATE products SET colors = 'Black,White' WHERE colors IS NULL;

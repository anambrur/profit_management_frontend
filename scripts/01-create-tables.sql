-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    mart VARCHAR(50) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    condition VARCHAR(20) NOT NULL,
    availability VARCHAR(20) NOT NULL,
    wpid VARCHAR(50),
    upc VARCHAR(50),
    gtin VARCHAR(50),
    product_name TEXT NOT NULL,
    product_type VARCHAR(100),
    on_hand INTEGER DEFAULT 0,
    available INTEGER DEFAULT 0,
    published_status VARCHAR(20),
    lifecycle_status VARCHAR(20),
    store_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create purchase_history table
CREATE TABLE IF NOT EXISTS purchase_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    cost_of_price DECIMAL(10, 2) NOT NULL,
    sell_price DECIMAL(10, 2) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_product_id ON purchase_history(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON purchase_history(purchase_date);

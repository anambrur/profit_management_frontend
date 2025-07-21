-- Insert sample product data
INSERT INTO products (
    mart, sku, condition, availability, wpid, upc, gtin, 
    product_name, product_type, on_hand, available, 
    published_status, lifecycle_status, store_id
) VALUES (
    'WALMART_US',
    '0044387030151',
    'New',
    'In_stock',
    '76666L8CSUZK',
    '044387030151',
    '00044387030151',
    'DeLonghi Capsule Compact Ceramic Heater in White',
    'Space Heaters',
    0,
    0,
    'PUBLISHED',
    'ACTIVE',
    '10002764712'
) ON CONFLICT (sku) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    availability = EXCLUDED.availability,
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample purchase history data
INSERT INTO purchase_history (
    product_id, quantity, cost_of_price, sell_price, purchase_date
) VALUES (
    (SELECT id FROM products WHERE sku = '0044387030151'),
    0,
    0.00,
    26.00,
    '2025-06-03T06:52:18.689+00:00'
);

-- Insert additional sample data for demonstration
INSERT INTO products (
    mart, sku, condition, availability, wpid, upc, gtin, 
    product_name, product_type, on_hand, available, 
    published_status, lifecycle_status, store_id
) VALUES 
(
    'WALMART_US',
    '0044387030152',
    'New',
    'In_stock',
    '76666L8CSUZL',
    '044387030152',
    '00044387030152',
    'DeLonghi Tower Ceramic Heater in Black',
    'Space Heaters',
    5,
    3,
    'PUBLISHED',
    'ACTIVE',
    '10002764712'
),
(
    'WALMART_US',
    '0044387030153',
    'New',
    'Out_of_stock',
    '76666L8CSUZM',
    '044387030153',
    '00044387030153',
    'DeLonghi Oil-Filled Radiator Heater',
    'Space Heaters',
    0,
    0,
    'PUBLISHED',
    'ACTIVE',
    '10002764712'
) ON CONFLICT (sku) DO NOTHING;

-- Insert additional purchase history
INSERT INTO purchase_history (
    product_id, quantity, cost_of_price, sell_price, purchase_date
) VALUES 
(
    (SELECT id FROM products WHERE sku = '0044387030152'),
    2,
    45.00,
    89.99,
    '2025-06-02T14:30:00.000+00:00'
),
(
    (SELECT id FROM products WHERE sku = '0044387030153'),
    1,
    75.00,
    149.99,
    '2025-06-01T09:15:00.000+00:00'
);

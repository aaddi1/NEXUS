-- USERS / TEAM
INSERT INTO users (name, email, password_hash, role, workspace_type) VALUES
('Aryan Sharma', 'aryan@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'superadmin', 'system'),
('Aryan Sharma', 'admin123@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'superadmin', 'enterprise'),
('Reliance Enterprise Owner', 'reliance@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'Owner', 'enterprise'),
('Local Retail Shop Owner', 'shopowner@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'Shop Owner', 'shop_owner'),
('Riya Mehta', 'riya@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'Sales Lead', 'enterprise'),
('Rahul Kapoor', 'rahul@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'Inventory Manager', 'enterprise'),
('Arjun Verma', 'arjun@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'Finance Lead', 'enterprise'),
('Priya Nair', 'priya@nexus.com', '$2b$10$H6ykvcLYkWO9K/c7AOlHqO8FRFvhVKrHRqtCBmvTBXUFzKerIUyAe', 'Sales', 'enterprise')
ON CONFLICT (email) DO NOTHING;

-- CATEGORIES
INSERT INTO categories (name) VALUES
('Fresh Produce'),
('Beverages'),
('Bakery'),
('Dry Fruits'),
('Snacks')
ON CONFLICT (name) DO NOTHING;

-- CUSTOMERS
INSERT INTO customers (name, email, phone, company, city) VALUES
('Riya Mehta', 'riya.mehta@example.com', '+91 98765 10001', 'Aarav Organics', 'Mumbai'),
('Arjun Verma', 'arjun.verma@example.com', '+91 98765 10002', 'Bharat Brew Co.', 'Delhi'),
('Priya Nair', 'priya.nair@example.com', '+91 98765 10003', 'Masala & More', 'Bengaluru'),
('Neha Sharma', 'neha.sharma@example.com', '+91 98765 10004', 'Chai Junction', 'Mumbai'),
('Vivek Malhotra', 'vivek.malhotra@example.com', '+91 98765 10005', 'Shree Bakers', 'Delhi'),
('Kavya Singh', 'kavya.singh@example.com', '+91 98765 10006', 'Desi Goods', 'Bengaluru')
ON CONFLICT DO NOTHING;

-- PRODUCTS
INSERT INTO products (name, sku, category_id, price)
SELECT 'Alphonso Mango Crate', 'NX-MNG-001', id, 3200
FROM categories WHERE name = 'Fresh Produce'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Filter Coffee Concentrate', 'NX-CFE-001', id, 1800
FROM categories WHERE name = 'Beverages'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Multigrain Atta Bread', 'NX-BRD-001', id, 90
FROM categories WHERE name = 'Bakery'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Organic Honey Jar 500g', 'NX-HNY-001', id, 450
FROM categories WHERE name = 'Snacks'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Nimbu Soda Bottle', 'NX-SOD-001', id, 60
FROM categories WHERE name = 'Beverages'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Kaju Badam Mix', 'NX-DRY-001', id, 650
FROM categories WHERE name = 'Dry Fruits'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Desi Tamatar Box', 'NX-TOM-001', id, 520
FROM categories WHERE name = 'Fresh Produce'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, category_id, price)
SELECT 'Dark Chocolate Bar 70%', 'NX-CHO-001', id, 180
FROM categories WHERE name = 'Snacks'
ON CONFLICT (sku) DO NOTHING;

-- INVENTORY
INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Mumbai', 120
FROM products WHERE sku = 'NX-MNG-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Mumbai', 85
FROM products WHERE sku = 'NX-CFE-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Delhi', 240
FROM products WHERE sku = 'NX-BRD-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Mumbai', 75
FROM products WHERE sku = 'NX-HNY-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Bengaluru', 300
FROM products WHERE sku = 'NX-SOD-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Delhi', 110
FROM products WHERE sku = 'NX-DRY-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Mumbai', 95
FROM products WHERE sku = 'NX-TOM-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;

INSERT INTO inventory (product_id, warehouse, quantity)
SELECT id, 'Bengaluru', 150
FROM products WHERE sku = 'NX-CHO-001'
ON CONFLICT (product_id, warehouse) DO NOTHING;
-- ORDERS
INSERT INTO orders (customer_id, status, payment_status, total)
SELECT id, 'completed', 'paid', 3200
FROM customers WHERE email = 'riya.mehta@example.com'
LIMIT 1;

INSERT INTO orders (customer_id, status, payment_status, total)
SELECT id, 'processing', 'paid', 1800
FROM customers WHERE email = 'arjun.verma@example.com'
LIMIT 1;

INSERT INTO orders (customer_id, status, payment_status, total)
SELECT id, 'pending', 'pending', 650
FROM customers WHERE email = 'priya.nair@example.com'
LIMIT 1;

INSERT INTO orders (customer_id, status, payment_status, total)
SELECT id, 'completed', 'paid', 900
FROM customers WHERE email = 'neha.sharma@example.com'
LIMIT 1;


-- INVOICES
INSERT INTO invoices
(customer_id, invoice_number, status, issue_date, due_date, total)
SELECT id, 'INV-2026-001', 'paid', CURRENT_DATE - 12, CURRENT_DATE - 2, 3200
FROM customers WHERE email = 'riya.mehta@example.com'
LIMIT 1;

INSERT INTO invoices
(customer_id, invoice_number, status, issue_date, due_date, total)
SELECT id, 'INV-2026-002', 'sent', CURRENT_DATE - 7, CURRENT_DATE + 7, 1800
FROM customers WHERE email = 'arjun.verma@example.com'
LIMIT 1;

INSERT INTO invoices
(customer_id, invoice_number, status, issue_date, due_date, total)
SELECT id, 'INV-2026-003', 'overdue', CURRENT_DATE - 20, CURRENT_DATE - 5, 650
FROM customers WHERE email = 'priya.nair@example.com'
LIMIT 1;


-- ORDER ITEMS
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 3200
FROM orders o, products p
WHERE o.total = 3200 AND p.sku = 'NX-MNG-001'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 1800
FROM orders o, products p
WHERE o.total = 1800 AND p.sku = 'NX-CFE-001'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 650
FROM orders o, products p
WHERE o.total = 650 AND p.sku = 'NX-DRY-001'
LIMIT 1;

-- INVOICE ITEMS
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price)
SELECT i.id, p.id, 'Alphonso Mango Crate - Premium Export Quality', 1, 3200
FROM invoices i, products p
WHERE i.invoice_number = 'INV-2026-001' AND p.sku = 'NX-MNG-001'
LIMIT 1;

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price)
SELECT i.id, p.id, 'Filter Coffee Concentrate 1L Bottle', 1, 1800
FROM invoices i, products p
WHERE i.invoice_number = 'INV-2026-002' AND p.sku = 'NX-CFE-001'
LIMIT 1;

INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price)
SELECT i.id, p.id, 'Kaju Badam Dry Fruits Mixed Pack', 1, 650
FROM invoices i, products p
WHERE i.invoice_number = 'INV-2026-003' AND p.sku = 'NX-DRY-001'
LIMIT 1;

-- DEALS
INSERT INTO deals
(customer_id, name, stage, value, probability)
SELECT id, 'Aarav Organics Supply Contract', 'proposal', 125000, 70
FROM customers WHERE email = 'riya.mehta@example.com'
LIMIT 1;

INSERT INTO deals
(customer_id, name, stage, value, probability)
SELECT id, 'Bharat Brew Expansion', 'negotiation', 85000, 80
FROM customers WHERE email = 'arjun.verma@example.com'
LIMIT 1;

INSERT INTO deals
(customer_id, name, stage, value, probability)
SELECT id, 'Masala & More Retail Deal', 'qualified', 45000, 50
FROM customers WHERE email = 'priya.nair@example.com'
LIMIT 1;

-- COMPLAINTS / HELP DESK TICKETS
INSERT INTO complaints (user_name, user_email, company, type, subject, message, priority, status) VALUES
('Riya Mehta', 'riya.mehta@example.com', 'Aarav Organics', 'Billing & Invoice Issue', 'GST computation clarification on export items', 'We need assistance with zero-rated GST entries on export mango shipments to UAE.', 'high', 'open'),
('Arjun Verma', 'arjun.verma@example.com', 'Bharat Brew Co.', 'Stock / Warehouse Desync', 'Stock count mismatch during Delhi transfer', 'After transfer #TRF-8821, Delhi depot inventory took 2 minutes to show updated quantity.', 'medium', 'open'),
('Shop Owner Rajesh', 'rajesh@kirana.in', 'Rajesh Supermart', 'Feature Request / Feedback', 'Request for barcode scanner support at POS', 'Would love to have instant barcode scanning on the Create Order screen.', 'normal', 'open'),
('Priya Nair', 'priya.nair@example.com', 'Masala & More', 'Account & Access', 'Password reset request for regional executive', 'Need password reset assistance for our south region sales executive.', 'high', 'resolved');

-- BUG REPORTS / SYSTEM DIAGNOSTICS
INSERT INTO bug_reports (user_email, component, error_message, severity, status) VALUES
('system_monitor@nexus.com', 'PostgreSQL Pool', 'Temporary latency spike during bulk invoice PDF generation', 'normal', 'resolved'),
('riya.mehta@example.com', 'PDFKit Exporter', 'Currency symbol alignment on landscape invoice format', 'low', 'open'),
('rahul@nexus.com', 'FastAPI Engine', 'Cache warm-up required on 30-day forecast OLS regression', 'normal', 'resolved');


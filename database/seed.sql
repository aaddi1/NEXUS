-- USERS / TEAM
INSERT INTO users (name, email, password_hash, role, workspace_type) VALUES
('Aryan Sharma', 'aryan@nexus.com', '$2b$10$1JnUPBiwd89sxtd0K4l4LOTs7pmtHap5MBLRROe/BLVr6fDtDb8EW', 'superadmin', 'system'),
('Aryan Sharma', 'admin123@nexus.com', '$2b$10$M1zWh0T4Qs36b2Gcd0Ipv.TkogNiZjRt0WMHZun7gvhTpyzLJ3VfS', 'superadmin', 'enterprise'),
('Reliance Enterprise Owner', 'reliance@nexus.com', '$2b$10$/eRnZksNa391GUYQ3pNMlecYts1mwXWH.ZpPvfkOMmbDc.nXdxCT6', 'Owner', 'enterprise'),
('Local Retail Shop Owner', 'shopowner@nexus.com', '$2b$10$RG3J1KobCGCvdQzF4VDrSeh0y8K4wHB7rVYNyAhY.5WS.B7CVNqcG', 'Shop Owner', 'shop_owner'),
('Riya Mehta', 'riya@nexus.com', '$2b$10$AdScLeGet36TsP8owZs0h.2pdpIq.oe/nss5VO3qMUO6p8qvSlbkW', 'Sales Lead', 'enterprise'),
('Rahul Kapoor', 'rahul@nexus.com', '$2b$10$ODJLSK3TZFY0rYD7QUr4bO4UoIGXZHRqCQ67N63H9IYPSJOGLn9Mu', 'Inventory Manager', 'enterprise'),
('Arjun Verma', 'arjun@nexus.com', '$2b$10$5aN4EEUi3xORfiHhff.RcOOBS.nhR.9yt080JTJEjLUEfaA/pbVDW', 'Finance Lead', 'enterprise'),
('Priya Nair', 'priya@nexus.com', '$2b$10$LJfRdah9uy426.NAHm/GdOxdkw9OG61J.EInAgHcKgyAsQAO2w9Ie', 'Sales', 'enterprise')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

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

-- EMPLOYEE SALARIES
INSERT INTO employee_salaries (employee_id, amount, payment_date, salary_month, salary_invoice_number, notes)
SELECT id, 65000, '2026-09-01', 'August 2026', 'SAL-2026-08-01', 'Sales Lead monthly salary + performance bonus'
FROM users WHERE email = 'riya@nexus.com'
LIMIT 1;

INSERT INTO employee_salaries (employee_id, amount, payment_date, salary_month, salary_invoice_number, notes)
SELECT id, 55000, '2026-09-01', 'August 2026', 'SAL-2026-08-02', 'Inventory Manager monthly compensation'
FROM users WHERE email = 'rahul@nexus.com'
LIMIT 1;

INSERT INTO employee_salaries (employee_id, amount, payment_date, salary_month, salary_invoice_number, notes)
SELECT id, 60000, '2026-09-01', 'August 2026', 'SAL-2026-08-03', 'Finance Lead monthly salary'
FROM users WHERE email = 'arjun@nexus.com'
LIMIT 1;

INSERT INTO employee_salaries (employee_id, amount, payment_date, salary_month, salary_invoice_number, notes)
SELECT id, 45000, '2026-09-01', 'August 2026', 'SAL-2026-08-04', 'Sales Executive monthly salary'
FROM users WHERE email = 'priya@nexus.com'
LIMIT 1;

-- EMPLOYEE ASSIGNED ITEMS / SAMPLES
INSERT INTO employee_items (employee_id, product_id, quantity, issued_date, status, notes)
SELECT u.id, p.id, 5, '2026-09-10', 'issued', 'Client demo samples for export trade show'
FROM users u, products p
WHERE u.email = 'riya@nexus.com' AND p.sku = 'NX-MNG-001'
LIMIT 1;

INSERT INTO employee_items (employee_id, product_id, quantity, issued_date, status, notes)
SELECT u.id, p.id, 2, '2026-09-12', 'issued', 'Retail counter tasting sample bottles'
FROM users u, products p
WHERE u.email = 'priya@nexus.com' AND p.sku = 'NX-CFE-001'
LIMIT 1;

-- COMPANY EXPENSES
INSERT INTO expenses (category, amount, description, expense_date) VALUES
('Warehouse Rent', 45000, 'Monthly lease for Mumbai Central Depot WH-1', '2026-09-01'),
('Logistics & Freight', 18500, 'Inter-depot cold storage transport Mumbai to Delhi', '2026-09-05'),
('Packaging Materials', 12000, 'Heavy-duty export corrugated carton procurement', '2026-09-08'),
('Cloud & Infrastructure', 8500, 'PostgreSQL cluster and AWS server hosting', '2026-09-10');

-- ATTRIBUTE ORDERS TO EMPLOYEES
UPDATE orders SET employee_id = (SELECT id FROM users WHERE email = 'riya@nexus.com' LIMIT 1) WHERE id % 2 = 0;
UPDATE orders SET employee_id = (SELECT id FROM users WHERE email = 'priya@nexus.com' LIMIT 1) WHERE id % 2 = 1;
UPDATE deals SET employee_id = (SELECT id FROM users WHERE email = 'riya@nexus.com' LIMIT 1) WHERE id % 2 = 0;
UPDATE deals SET employee_id = (SELECT id FROM users WHERE email = 'priya@nexus.com' LIMIT 1) WHERE id % 2 = 1;



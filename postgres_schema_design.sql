-- ============================================================================
-- PostgreSQL Database Schema Design
-- Target System: Standard PostgreSQL (v12+) / Supabase / AWS RDS
-- Description: Core Schema for User Profiles, Items Catalog, and Transaction Logs
-- ============================================================================

-- Enable UUID extension for auto-generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
-- Stores administrative, partner, or client metadata for system authentication.
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('administrator', 'manager', 'operator', 'viewer')),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast user lookups and filter capabilities
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);


-- 2. ITEMS TABLE
-- Managed catalog representing inventory products, physical assets, or virtual items.
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL, -- Stock Keeping Unit / Item identifier 
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'general' CHECK (category IN ('electronics', 'software', 'hardware', 'services', 'office_supplies', 'general')),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0.00),
    base_cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (base_cost >= 0.00),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_point INTEGER DEFAULT 10 CHECK (reorder_point >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'discontinued')),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Audits which operator registered the item
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize filters on category, pricing boundaries, stock statuses, or SKU queries
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_pricing ON items(price);
CREATE INDEX idx_items_created_by ON items(created_by);


-- 3. TRANSACTION LOGS TABLE
-- Complete, immutable ledger of activities, stock level modifications, price adjustments, or log occurrences.
CREATE TABLE transaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- User who committed or authorized the transaction
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,           -- Cascades deletion when item is dropped
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('create_item', 'stock_in', 'stock_out', 'inventory_audit', 'price_change', 'purchase_order', 'disposal')),
    quantity_change INTEGER NOT NULL DEFAULT 0, -- Positive for increments (stock_in), negative for decrements (stock_out)
    unit_price NUMERIC(12, 2) CHECK (unit_price >= 0.00), -- Price context at the exact moment of transaction
    old_state JSONB, -- Pre-transaction values capture for auditing / reconciliation
    new_state JSONB, -- Post-transaction values capture
    notes TEXT,
    ip_address VARCHAR(45), -- Supports IPv4 and IPv6 string representations
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- Unchangeable log timestamp
);

-- Indexes to retrieve fast sub-queries or reports based on timeframes, transaction types, or item ID
CREATE INDEX idx_transaction_logs_item ON transaction_logs(item_id);
CREATE INDEX idx_transaction_logs_user ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_type ON transaction_logs(transaction_type);
CREATE INDEX idx_transaction_logs_created_at ON transaction_logs(created_at);


-- ============================================================================
-- AUDITING TRIGGERS & TRIGGERS PROCEDURES
-- ============================================================================

-- Function to handle auto-updating `updated_at` attribute on change
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp updater to `user_profiles`
CREATE TRIGGER trg_user_profiles_update_timestamp
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

-- Apply timestamp updater to `items`
CREATE TRIGGER trg_items_update_timestamp
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();


-- Triggers function to dynamically log stock and pricing updates to `transaction_logs` automatically!
CREATE OR REPLACE FUNCTION trigger_log_item_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_transaction_type VARCHAR(50);
    v_qty_change INTEGER := 0;
    v_price NUMERIC(12, 2) := 0.00;
BEGIN
    -- Determine transaction context
    IF (TG_OP = 'INSERT') THEN
        v_transaction_type := 'create_item';
        v_qty_change := NEW.stock_quantity;
        v_price := NEW.price;
        
        INSERT INTO transaction_logs(user_id, item_id, transaction_type, quantity_change, unit_price, old_state, new_state, notes)
        VALUES (
            NEW.created_by,
            NEW.id,
            v_transaction_type,
            v_qty_change,
            v_price,
            NULL,
            row_to_json(NEW)::jsonb,
            'Item catalog creation initial log.'
        );
        RETURN NEW;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        v_qty_change := NEW.stock_quantity - OLD.stock_quantity;
        v_price := NEW.price;
        
        IF (OLD.price != NEW.price AND v_qty_change = 0) THEN
            v_transaction_type := 'price_change';
        ELSIF (v_qty_change > 0) THEN
            v_transaction_type := 'stock_in';
        ELSIF (v_qty_change < 0) THEN
            v_transaction_type := 'stock_out';
        ELSE
            v_transaction_type := 'inventory_audit';
        END IF;
        
        INSERT INTO transaction_logs(user_id, item_id, transaction_type, quantity_change, unit_price, old_state, new_state, notes)
        VALUES (
            NEW.created_by, -- Assuming created_by field is updated or can represent active system context
            NEW.id,
            v_transaction_type,
            v_qty_change,
            v_price,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb,
            CONCAT('Automatic audit log trace on update operation. Quantity difference: ', v_qty_change, ', Price value: ', v_price)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply automatic transaction tracking triggers to catalog items
CREATE TRIGGER trg_items_audit_logs
    AFTER INSERT OR UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_item_changes();


-- ============================================================================
-- MASTER SEED TEST DATA
-- ============================================================================

-- Seed User Profiles
INSERT INTO user_profiles (id, email, full_name, phone_number, role, status, timezone) VALUES
('d01b17b6-1934-4b53-b472-e1d8820ea3be', 'adarshsinghgautam2@gmail.com', 'Adarsh Singh Gautam', '+919999999999', 'administrator', 'active', 'Asia/Kolkata'),
('0ea94348-18be-4d9a-9e19-86641eef55f0', 'operator.operations@deadlineos.in', 'Rajesh Kumar', '+919876543210', 'operator', 'active', 'Asia/Kolkata'),
('4e16d400-ee46-4cb2-8321-d70319ad0e0a', 'inactive.viewer@deadlineos.in', 'Amit Sharma', NULL, 'viewer', 'inactive', 'UTC');

-- Seed Catalog Items (This triggers 'create_item' entries inside `transaction_logs` automatically!)
INSERT INTO items (id, sku, name, description, category, price, base_cost, stock_quantity, reorder_point, status, created_by) VALUES
('2b64dd91-628d-4e94-9b1d-f8ec00609fc2', 'SKU-ELEC-MACBOOK-PRO-01', 'MacBook Pro 16" (M3 Max, 64GB, 1TB)', 'Enterprise grade computing hardware for engineering department.', 'electronics', 3499.99, 2900.00, 25, 5, 'available', 'd01b17b6-1934-4b53-b472-e1d8820ea3be'),
('5edc1538-40af-403d-82fa-101490ee53fb', 'SKU-SOFT-DEADLINEOS-ENT', 'DeadlineOS Corporate Enterprise License', '1-year rolling subscription for unlimited compliance calendar nodes and multi-tenant CA workspace.', 'software', 1200.00, 0.00, 1000, 10, 'available', 'd01b17b6-1934-4b53-b472-e1d8820ea3be'),
('9dfcf331-50e5-42df-b620-cced88dfa902', 'SKU-OFFI-DESK-CHAIR-05', 'Herman Miller Aeron Ergonomic Chair', 'Pallet storage office furniture item.', 'office_supplies', 1450.00, 1100.00, 4, 10, 'low_stock', '0ea94348-18be-4d9a-9e19-86641eef55f0');

-- Perform manual sample stock update to trace trigger workflow
UPDATE items 
SET stock_quantity = 32, price = 3399.99 
WHERE sku = 'SKU-ELEC-MACBOOK-PRO-01';

UPDATE items 
SET stock_quantity = 0, status = 'out_of_stock' 
WHERE sku = 'SKU-OFFI-DESK-CHAIR-05';

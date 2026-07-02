-- Stellar Global Supplies - Order Management System
-- Database Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  delivery_timeline DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Order Received' CHECK (status IN ('Order Received', 'Processing', 'Ready to Dispatch', 'Delivered')),
  payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Partial', 'Paid')),
  total_amount DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_delivery_timeline ON orders(delivery_timeline);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.top_sku(id),
  material_id UUID NOT NULL REFERENCES public.material_spilt(id),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL CHECK (unit IN ('Pieces', 'Kgs')),
  sale_cost DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * sale_cost) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_sku_id ON order_items(sku_id);
CREATE INDEX idx_order_items_material_id ON order_items(material_id);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX idx_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_status_history_changed_at ON order_status_history(changed_at DESC);

-- Order Notifications Table
CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'whatsapp')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_order_id ON order_notifications(order_id);
CREATE INDEX idx_notifications_status ON order_notifications(status);
CREATE INDEX idx_notifications_created_at ON order_notifications(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Orders: Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = created_by);

-- Orders: Users can update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = created_by);

-- Orders: Users can delete their own orders
CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (auth.uid() = created_by);

-- Order Items: Users can view items of their orders
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Order Items: Users can insert items for their orders
CREATE POLICY "Users can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Order Status History: Users can view their order status history
CREATE POLICY "Users can view status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Order Status History: Users can insert status history
CREATE POLICY "Users can insert status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Order Notifications: Users can view their notifications
CREATE POLICY "Users can view notifications" ON order_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_notifications.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Order Notifications: Backend can insert notifications
CREATE POLICY "Backend can insert notifications" ON order_notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update updated_at timestamp on orders
CREATE OR REPLACE FUNCTION update_orders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_timestamp_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_timestamp();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Order Summary View
CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.id,
  o.customer_name,
  o.phone,
  o.email,
  o.status,
  o.payment_status,
  o.total_amount,
  o.delivery_timeline,
  COUNT(oi.id) as item_count,
  o.created_at,
  o.updated_at,
  o.created_by
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.customer_name, o.phone, o.email, o.status, o.payment_status, o.total_amount, o.delivery_timeline, o.created_at, o.updated_at, o.created_by;

-- ============================================================================
-- SAMPLE QUERIES FOR TESTING
-- ============================================================================

-- Get all orders with items:
-- SELECT
--   o.*,
--   json_agg(json_build_object(
--     'id', oi.id,
--     'sku', ts.sku,
--     'material', ms.material,
--     'quantity', oi.quantity,
--     'unit', oi.unit,
--     'sale_cost', oi.sale_cost,
--     'subtotal', oi.subtotal
--   )) as items
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- LEFT JOIN top_sku ts ON oi.sku_id = ts.id
-- LEFT JOIN material_spilt ms ON oi.material_id = ms.id
-- GROUP BY o.id;

-- Get order count by status:
-- SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- Get orders by payment status:
-- SELECT * FROM orders WHERE payment_status = 'Pending';

-- Get orders with delivery in next 7 days:
-- SELECT * FROM orders WHERE delivery_timeline BETWEEN NOW()::date AND (NOW() + INTERVAL '7 days')::date;

-- SQL to update orders and products tables for offline order management and descriptions

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS payment_mode TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT;

-- RLS Policies for Admin Offline Orders
-- Assuming you have an admin check. If not, these allow authenticated users with specific emails.
-- Replace the emails if necessary or use your existing admin role check.

-- Allow admins to insert orders with null user_id
CREATE POLICY "Admins can insert offline orders" ON orders 
FOR INSERT TO authenticated 
WITH CHECK (
  auth.email() IN ('manojmurari3577@gmail.com', 'Mrudulavastra@gmail.com', 'Bhavani.balaji.murari@gmail.com')
);

-- Allow admins to insert order items
CREATE POLICY "Admins can insert order items" ON order_items 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id
  )
);

-- Allow admins to update product inventory
CREATE POLICY "Admins can update product inventory" ON products 
FOR UPDATE TO authenticated 
USING (
  auth.email() IN ('manojmurari3577@gmail.com', 'Mrudulavastra@gmail.com', 'Bhavani.balaji.murari@gmail.com')
)
WITH CHECK (
  auth.email() IN ('manojmurari3577@gmail.com', 'Mrudulavastra@gmail.com', 'Bhavani.balaji.murari@gmail.com')
);


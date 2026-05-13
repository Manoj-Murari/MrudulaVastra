-- Add shipping address columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode TEXT;

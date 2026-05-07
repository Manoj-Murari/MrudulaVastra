-- ============================================================
-- MRUDULA VASTRA — Full Database Migration
-- Execute this entire script in Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ENABLE ROW LEVEL SECURITY EXTENSION (already enabled)
-- ────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- 2. CREATE TABLES
-- ────────────────────────────────────────────────────────────

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id        TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  subtitle  TEXT NOT NULL,
  image     TEXT NOT NULL,
  link      TEXT NOT NULL,
  gradient  TEXT NOT NULL,
  tag       TEXT NOT NULL,
  color     TEXT NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  price           INTEGER NOT NULL,
  original_price  INTEGER NOT NULL,
  image           TEXT NOT NULL,
  tag             TEXT NOT NULL,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  reviews         INTEGER NOT NULL DEFAULT 0,
  badge           TEXT NOT NULL DEFAULT '',
  is_trending     BOOLEAN NOT NULL DEFAULT true,
  color           TEXT,
  material        TEXT,
  sizes           TEXT[]
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  location  TEXT NOT NULL,
  text      TEXT NOT NULL,
  rating    INTEGER NOT NULL DEFAULT 5
);

-- Orders (for future checkout flow)
CREATE TABLE IF NOT EXISTS public.orders (
  id            TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount  INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items (line items for each order)
CREATE TABLE IF NOT EXISTS public.order_items (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES public.products(id),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  INTEGER NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- 3. ENABLE ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 4. RLS POLICIES — Public read access for storefront data
-- ────────────────────────────────────────────────────────────

-- Categories: anyone can read
DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories"
  ON public.categories FOR SELECT
  USING (true);

-- Products: anyone can read
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products"
  ON public.products FOR SELECT
  USING (true);

-- Testimonials: anyone can read
DROP POLICY IF EXISTS "Allow public read on testimonials" ON public.testimonials;
CREATE POLICY "Allow public read on testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

-- Orders: only the owner can read their own orders
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Orders: authenticated users can insert their own orders
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items: only the order owner can read
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Order Items: authenticated users can insert for their own orders
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. SEED DATA — Categories
-- ────────────────────────────────────────────────────────────

INSERT INTO public.categories (id, title, subtitle, image, link, gradient, tag, color) VALUES
  ('c1', 'Sarees',          'Heritage Handlooms',  '/images/category-sarees.webp', '/collections/sarees',          'from-[#1A3C2E]/90 to-[#1A3C2E]/20', 'New Arrivals', '#1A3C2E'),
  ('c2', 'Dress Materials', 'Premium Unstitched',  '/images/category-dress.webp',  '/collections/dress-materials',  'from-[#3A2218]/90 to-[#3A2218]/20', 'Bestseller',   '#2C1810'),
  ('c3', 'Kids Wear',       'Festive Collection',  '/images/category-kids.webp',   '/collections/kids',             'from-[#2A314A]/90 to-[#2A314A]/20', 'Featured',     '#1C2B4A')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. SEED DATA — Products
-- ────────────────────────────────────────────────────────────

INSERT INTO public.products (id, name, category, price, original_price, image, tag, rating, reviews, badge, is_trending, color, material, sizes) VALUES
  (1, 'Kanjivaram Silk Saree',      'Sarees',          8499, 10999, '/images/trending-1.webp', 'As Seen on Reels', 4.9, 124, '🔥 Trending', true, 'Red', 'Pure Silk', ARRAY['Unstitched']),
  (2, 'Chanderi Cotton Suit Set',   'Dress Materials', 3299,  4199, '/images/trending-2.webp', 'Reel Favourite',   4.8,  89, '✨ New',       true, 'Yellow', 'Chanderi Cotton', ARRAY['Unstitched']),
  (3, 'Leheriya Anarkali Set',      'Kids Wear',       1899,  2499, '/images/trending-3.webp', 'Most Loved',       5.0,  67, '💛 Loved',     true, 'Pink', 'Cotton', ARRAY['2-3Y', '3-4Y', '4-5Y']),
  (4, 'Organza Embroidered Saree',  'Sarees',          6799,  8999, '/images/trending-4.webp', 'As Seen on Reels', 4.7, 103, '🎬 Reel Hit',  true, 'Blue', 'Organza', ARRAY['Unstitched'])
ON CONFLICT (id) DO NOTHING;

-- Reset the products id sequence to avoid conflicts with future inserts
SELECT setval(pg_get_serial_sequence('public.products', 'id'), (SELECT MAX(id) FROM public.products));

-- ────────────────────────────────────────────────────────────
-- 7. SEED DATA — Testimonials
-- ────────────────────────────────────────────────────────────

INSERT INTO public.testimonials (id, name, location, text, rating) VALUES
  (1, 'Priya Sharma',    'Hyderabad',  'The Kanjivaram I ordered was absolutely breathtaking. The quality surpassed every expectation. Will definitely order again!', 5),
  (2, 'Ananya Reddy',    'Bengaluru',  'My daughter looked like a little princess in her leheriya set. The fabric, the finish — everything was perfect. Thank you Mrudula Vastra!', 5),
  (3, 'Meera Krishnan',  'Chennai',    'I''ve been searching for quality dress materials for years. Found my forever brand. The chanderi collection is stunning.', 5)
ON CONFLICT (id) DO NOTHING;

-- Reset the testimonials id sequence
SELECT setval(pg_get_serial_sequence('public.testimonials', 'id'), (SELECT MAX(id) FROM public.testimonials));

-- ============================================================
-- ✅ MIGRATION COMPLETE
-- You should see 5 new tables: categories, products, 
-- testimonials, orders, order_items
-- With 3 categories, 4 products, and 3 testimonials seeded.
-- ============================================================

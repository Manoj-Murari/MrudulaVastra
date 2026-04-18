-- ────────────────────────────────────────────────────────────
-- Migration: Add inventory_count to products
-- Run this in your Supabase SQL Editor
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_count INTEGER NOT NULL DEFAULT 10;

-- Optionally mark one product as sold out for testing:
-- UPDATE public.products SET inventory_count = 0 WHERE id = 2;

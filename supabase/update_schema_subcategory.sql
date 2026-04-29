-- Migration to add sub_category to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sub_category text;

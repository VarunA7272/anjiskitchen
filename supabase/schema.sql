-- ═══════════════════════════════════════════════════════════════════════════
-- Anji's Kitchen — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categories Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sizes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reviews Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_image TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  message TEXT NOT NULL,
  product_name TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- ─── Site Settings / CMS Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all site_settings" ON site_settings;
CREATE POLICY "Allow all site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- ─── Row Level Security (RLS) Policies ────────────────────────────────────
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies if they exist
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin write categories" ON categories;
DROP POLICY IF EXISTS "Allow all categories" ON categories;

DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Admin read all products" ON products;
DROP POLICY IF EXISTS "Admin write products" ON products;
DROP POLICY IF EXISTS "Allow all products" ON products;

DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public submit reviews" ON reviews;
DROP POLICY IF EXISTS "Admin manage reviews" ON reviews;
DROP POLICY IF EXISTS "Allow all reviews" ON reviews;

-- Allow full access to categories, products, and reviews
CREATE POLICY "Allow all categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- ─── Storage Bucket Setup ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
CREATE POLICY "Public select product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public insert product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Public delete product-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- ─── Seed Initial Categories ──────────────────────────────────────────────
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
  ('Homemade Food', 'homemade-food', 'Fresh homemade meals and snacks made daily', 1, true),
  ('Baked Goods & Cakes', 'baked-goods', 'Freshly baked cakes, cookies, and pastries', 2, true),
  ('Pickles & Preserves', 'pickles', 'Traditional homemade pickles, chutneys and preserves', 3, true),
  ('Snacks & Namkeen', 'snacks', 'Crispy homemade snacks and namkeen', 4, true),
  ('Cosmetics & Skincare', 'cosmetics', 'Natural handmade cosmetics and skincare products', 5, true),
  ('Hair Clutchers', 'hair-clutchers', 'Beautiful handmade hair clutchers and accessories', 6, true)
ON CONFLICT (slug) DO NOTHING;

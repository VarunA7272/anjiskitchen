-- ═══════════════════════════════════════════════════════════════════════════
-- Anji's Kitchen — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension (usually already enabled)
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

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, authenticated write
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Products: Public read active products, authenticated write all
CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read all products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Reviews: Public read approved, public insert, authenticated manage all
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public submit reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');

-- ─── Storage Bucket ───────────────────────────────────────────────────────
-- Run this in Supabase Dashboard > Storage:
-- Create a new public bucket named: product-images
-- OR run via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- ─── Seed Initial Categories ──────────────────────────────────────────────
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
  ('Homemade Food', 'homemade-food', 'Fresh homemade meals and snacks made daily', 1, true),
  ('Baked Goods & Cakes', 'baked-goods', 'Freshly baked cakes, cookies, and pastries', 2, true),
  ('Pickles & Preserves', 'pickles', 'Traditional homemade pickles, chutneys and preserves', 3, true),
  ('Snacks & Namkeen', 'snacks', 'Crispy homemade snacks and namkeen', 4, true),
  ('Cosmetics & Skincare', 'cosmetics', 'Natural handmade cosmetics and skincare products', 5, true),
  ('Hair Accessories', 'hair-accessories', 'Beautiful handmade hair clutchers and accessories', 6, true)
ON CONFLICT (slug) DO NOTHING;

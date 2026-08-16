export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category_id: string;
  category?: { name: string; slug: string };
  sizes?: string[];
  tags?: string[];
  is_active: boolean;
  is_featured: boolean;
  stock_count?: number;
  created_at: string;
}

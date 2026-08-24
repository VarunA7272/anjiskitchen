import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Homemade Food', slug: 'homemade-food', description: 'Fresh, delicious home-cooked meals made with love', display_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Baked Goods & Cakes', slug: 'baked-goods', description: 'Handcrafted cakes, cookies, and sweet treats', display_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Pickles & Preserves', slug: 'pickles', description: 'Traditional homemade pickles and chutneys', display_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Snacks & Namkeen', slug: 'snacks', description: 'Crispy homemade Indian snacks', display_order: 4, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Cosmetics & Skincare', slug: 'cosmetics', description: 'Natural handmade beauty and skin products', display_order: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'Hair Clutchers', slug: 'hair-clutchers', description: 'Elegant handcrafted hair clips & clutchers', display_order: 6, is_active: true, created_at: new Date().toISOString() },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Special Homemade Veg Thali',
    slug: 'special-homemade-veg-thali',
    description: 'Complete home-style thali featuring Paneer Sabzi, Dal Tadka, 4 Butter Phulkas, Steamed Rice, Sweet, and Fresh Salad. Made fresh on order.',
    price: 180,
    original_price: 220,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-1',
    category: { name: 'Homemade Food', slug: 'homemade-food' },
    sizes: ['Single Meal', 'Family Combo (4 Servings)'],
    tags: ['Bestseller', 'Fresh Daily', 'Vegetarian'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Handcrafted Chocolate Fudge Cake',
    slug: 'handcrafted-chocolate-fudge-cake',
    description: 'Rich, moist chocolate cake layered with dark chocolate ganache and topped with chocolate curls. 100% eggless and baked fresh.',
    price: 450,
    original_price: 550,
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-2',
    category: { name: 'Baked Goods & Cakes', slug: 'baked-goods' },
    sizes: ['500g', '1 kg'],
    tags: ['Eggless', 'Bestseller', 'Cakes'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Traditional Mango Pickle (Aam Ka Achar)',
    slug: 'traditional-mango-pickle',
    description: 'Authentic Grandma recipe raw mango pickle made with pure mustard oil, aromatic spices, and sun-dried raw mangoes. No artificial preservatives.',
    price: 150,
    original_price: 180,
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 'cat-3',
    category: { name: 'Pickles & Preserves', slug: 'pickles' },
    sizes: ['250g', '500g', '1 kg'],
    tags: ['Traditional', 'Homemade', 'Spicy'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Almond Butter Crunch Cookies',
    slug: 'almond-butter-crunch-cookies',
    description: 'Crispy, melt-in-your-mouth cookies packed with roasted almond chunks and pure butter. Perfect tea-time snack.',
    price: 220,
    original_price: 260,
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-2',
    category: { name: 'Baked Goods & Cakes', slug: 'baked-goods' },
    sizes: ['200g Box', '400g Box'],
    tags: ['Cookies', 'Snack'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Special Crispy Mathri Box',
    slug: 'special-crispy-mathri-box',
    description: 'Flaky, savory fried mathri seasoned with ajwain and black pepper. Perfect with hot evening tea.',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-4',
    category: { name: 'Snacks & Namkeen', slug: 'snacks' },
    sizes: ['250g', '500g'],
    tags: ['Crispy', 'Namkeen'],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Pure Organic Rose Water Mist',
    slug: 'pure-organic-rose-water-mist',
    description: '100% natural steam-distilled rose water. Hydrates, refreshes, and tones skin gently. No alcohol or synthetic fragrances.',
    price: 250,
    original_price: 300,
    images: [
      'https://images.unsplash.com/photo-1608248597369-2413653a005c?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-5',
    category: { name: 'Cosmetics & Skincare', slug: 'cosmetics' },
    sizes: ['100ml Spray Bottle'],
    tags: ['Organic', 'Skincare'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Rose Floral Hair Clutchers (Pair)',
    slug: 'rose-floral-hair-clutchers-pair',
    description: 'Set of 2 elegant handcrafted hair clutchers embellished with soft rose pink petals and pearl beads.',
    price: 199,
    original_price: 249,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-6',
    category: { name: 'Hair Clutchers', slug: 'hair-clutchers' },
    sizes: ['Standard Pair'],
    tags: ['Handcrafted', 'Accessories'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Spicy Stuffed Red Chilli Pickle',
    slug: 'spicy-stuffed-red-chilli-pickle',
    description: 'Authentic Banarasi-style stuffed red chilli pickle infused with roasted spices, amchur, and mustard oil.',
    price: 170,
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
    ],
    category_id: 'cat-3',
    category: { name: 'Pickles & Preserves', slug: 'pickles' },
    sizes: ['250g', '500g'],
    tags: ['Spicy', 'Pickle'],
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString()
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customer_name: 'Priya Sharma',
    rating: 5,
    message: 'The Chocolate Fudge Cake was absolutely divine! So moist and not overly sweet. Delivered fresh right to our home in Jabalpur.',
    product_name: 'Handcrafted Chocolate Fudge Cake',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'rev-2',
    customer_name: 'Rajesh Verma',
    rating: 5,
    message: 'Reminds me of my grandmother\'s homemade pickles. The Aam Ka Achar has perfect flavor and spice level. Highly recommended!',
    product_name: 'Traditional Mango Pickle',
    is_approved: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'rev-3',
    customer_name: 'Ananya Gupta',
    rating: 5,
    message: 'Ordered the Rose Water Mist and hair clutchers — both are amazing quality! Ordering via WhatsApp was super convenient.',
    product_name: 'Pure Organic Rose Water Mist',
    is_approved: true,
    created_at: new Date().toISOString()
  }
];

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isMockMode = true;

  // In-memory mock storage
  private mockCategories: Category[] = [];
  private mockProducts: Product[] = [];
  private mockReviews: Review[] = [];

  constructor() {
    this.initMockData();

    // Check if real Supabase URL is configured
    const url = environment.supabase?.url || '';
    const key = environment.supabase?.anonKey || '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        this.supabase = createClient(url, key);
        this.isMockMode = false;
      } catch (err) {
        console.warn('Supabase client init failed, falling back to Mock Data Mode.', err);
        this.isMockMode = true;
      }
    } else {
      this.isMockMode = true;
    }
  }

  private initMockData() {
    try {
      const storedCats = localStorage.getItem('anjis_mock_cats');
      this.mockCategories = storedCats ? JSON.parse(storedCats) : INITIAL_CATEGORIES;

      const storedProds = localStorage.getItem('anjis_mock_prods');
      this.mockProducts = storedProds ? JSON.parse(storedProds) : INITIAL_PRODUCTS;

      const storedRevs = localStorage.getItem('anjis_mock_revs');
      this.mockReviews = storedRevs ? JSON.parse(storedRevs) : INITIAL_REVIEWS;
    } catch {
      this.mockCategories = [...INITIAL_CATEGORIES];
      this.mockProducts = [...INITIAL_PRODUCTS];
      this.mockReviews = [...INITIAL_REVIEWS];
    }
  }

  private saveMockData() {
    try {
      localStorage.setItem('anjis_mock_cats', JSON.stringify(this.mockCategories));
      localStorage.setItem('anjis_mock_prods', JSON.stringify(this.mockProducts));
      localStorage.setItem('anjis_mock_revs', JSON.stringify(this.mockReviews));
    } catch {}
  }

  // ─── Site Settings / CMS ──────────────────────────────────────────────────
  async getSiteSettings(): Promise<any | null> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('site_settings').select('*').eq('key', 'main_config').single();
        if (!error && data) return data.value;
      } catch {}
    }
    const stored = localStorage.getItem('anjis_site_settings');
    return stored ? JSON.parse(stored) : null;
  }

  async updateSiteSettings(settings: any): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      try {
        await this.supabase.from('site_settings').upsert({ key: 'main_config', value: settings, updated_at: new Date().toISOString() });
        return;
      } catch {}
    }
    localStorage.setItem('anjis_site_settings', JSON.stringify(settings));
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────
  async signIn(email: string, _password: string): Promise<AuthResponse> {
    if (!this.supabase) {
      return {
        data: { user: null, session: null },
        error: { message: 'Supabase URL & Anon Key not configured in environment.ts' } as any
      };
    }

    // Strictly authenticate via real Supabase Auth service
    return await this.supabase.auth.signInWithPassword({ email, password: _password });
  }

  async signOut(): Promise<void> {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
  }

  async getSession(): Promise<Session | null> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase.auth.getSession();
        if (data.session) return data.session;
      } catch {}
    }
    return null;
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (this.supabase) {
      return this.supabase.auth.onAuthStateChange((_event, session) => callback(session));
    }
    callback(null);
    return { subscription: { unsubscribe: () => {} } };
  }

  // ─── Categories ────────────────────────────────────────────────────────────
  async getCategories(): Promise<Category[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('categories').select('*').eq('is_active', true).order('display_order');
        if (!error && data) return data;
      } catch {}
    }
    return this.mockCategories.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order);
  }

  async getAllCategories(): Promise<Category[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('categories').select('*').order('display_order');
        if (!error && data) return data;
      } catch {}
    }
    return [...this.mockCategories].sort((a, b) => a.display_order - b.display_order);
  }

  async createCategory(cat: Partial<Category>): Promise<Category> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('categories').insert(cat).select().single();
      if (!error && data) return data;
    }
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: cat.name || 'New Category',
      slug: cat.slug || (cat.name || 'cat').toLowerCase().replace(/\s+/g, '-'),
      description: cat.description,
      display_order: cat.display_order ?? this.mockCategories.length + 1,
      is_active: cat.is_active ?? true,
      created_at: new Date().toISOString()
    };
    this.mockCategories.push(newCat);
    this.saveMockData();
    return newCat;
  }

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('categories').update(cat).eq('id', id).select().single();
      if (!error && data) return data;
    }
    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCategories[index] = { ...this.mockCategories[index], ...cat };
      this.saveMockData();
      return this.mockCategories[index];
    }
    throw new Error('Category not found');
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('categories').delete().eq('id', id);
    }
    this.mockCategories = this.mockCategories.filter(c => c.id !== id);
    this.saveMockData();
  }

  // ─── Products ──────────────────────────────────────────────────────────────
  async getProducts(opts?: { categoryId?: string; featured?: boolean; limit?: number; offset?: number; search?: string }): Promise<Product[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        let query = this.supabase.from('products').select('*, category:categories(name, slug)').eq('is_active', true).order('created_at', { ascending: false });
        if (opts?.categoryId) query = query.eq('category_id', opts.categoryId);
        if (opts?.featured) query = query.eq('is_featured', true);
        if (opts?.search) query = query.ilike('name', `%${opts.search}%`);
        if (opts?.limit) query = query.limit(opts.limit);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch {}
    }

    let list = this.mockProducts.filter(p => p.is_active);
    if (opts?.categoryId) {
      list = list.filter(p => p.category_id === opts.categoryId || p.category?.slug === opts.categoryId);
    }
    if (opts?.featured) {
      list = list.filter(p => p.is_featured);
    }
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (opts?.limit) {
      list = list.slice(0, opts.limit);
    }
    return list;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data } = await this.supabase.from('products').select('*, category:categories(name, slug)').eq('slug', slug).eq('is_active', true).single();
        if (data) return data;
      } catch {}
    }
    return this.mockProducts.find(p => p.slug === slug && p.is_active) || null;
  }

  async getAllProducts(): Promise<Product[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('products').select('*, category:categories(name, slug)').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch {}
    }
    return [...this.mockProducts];
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('products').insert(product).select().single();
      if (!error && data) return data;
    }
    const catObj = this.mockCategories.find(c => c.id === product.category_id);
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: product.name || 'New Product',
      slug: product.slug || (product.name || 'prod').toLowerCase().replace(/\s+/g, '-'),
      description: product.description || '',
      price: product.price || 100,
      original_price: product.original_price,
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
      category_id: product.category_id || 'cat-1',
      category: catObj ? { name: catObj.name, slug: catObj.slug } : undefined,
      sizes: product.sizes || [],
      tags: product.tags || [],
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      created_at: new Date().toISOString()
    };
    this.mockProducts.unshift(newProd);
    this.saveMockData();
    return newProd;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    if (!this.isMockMode && this.supabase) {
      const { data, error } = await this.supabase.from('products').update(product).eq('id', id).select().single();
      if (!error && data) return data;
    }
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const updated = { ...this.mockProducts[index], ...product };
      if (product.category_id) {
        const cat = this.mockCategories.find(c => c.id === product.category_id);
        if (cat) updated.category = { name: cat.name, slug: cat.slug };
      }
      this.mockProducts[index] = updated;
      this.saveMockData();
      return updated;
    }
    throw new Error('Product not found');
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('products').delete().eq('id', id);
    }
    this.mockProducts = this.mockProducts.filter(p => p.id !== id);
    this.saveMockData();
  }

  // ─── Reviews ───────────────────────────────────────────────────────────────
  async getApprovedReviews(): Promise<Review[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch {}
    }
    return this.mockReviews.filter(r => r.is_approved);
  }

  async getAllReviews(): Promise<Review[]> {
    if (!this.isMockMode && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch {}
    }
    return [...this.mockReviews];
  }

  async submitReview(review: Partial<Review>): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('reviews').insert({ ...review, is_approved: false });
      return;
    }
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      customer_name: review.customer_name || 'Anonymous',
      rating: review.rating || 5,
      message: review.message || '',
      product_name: review.product_name,
      is_approved: false,
      created_at: new Date().toISOString()
    };
    this.mockReviews.unshift(newRev);
    this.saveMockData();
  }

  async approveReview(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    }
    const rev = this.mockReviews.find(r => r.id === id);
    if (rev) {
      rev.is_approved = true;
      this.saveMockData();
    }
  }

  async deleteReview(id: string): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      await this.supabase.from('reviews').delete().eq('id', id);
    }
    this.mockReviews = this.mockReviews.filter(r => r.id !== id);
    this.saveMockData();
  }

  // ─── Storage ───────────────────────────────────────────────────────────────
  async uploadImage(file: File, _bucket: string = 'product-images'): Promise<string> {
    if (!this.isMockMode && this.supabase) {
      try {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await this.supabase.storage.from(_bucket).upload(fileName, file);
        if (!error) {
          const { data } = this.supabase.storage.from(_bucket).getPublicUrl(fileName);
          return data.publicUrl;
        }
      } catch {}
    }

    // Mock Image URL via FileReader base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  async deleteImage(_url: string, _bucket: string = 'product-images'): Promise<void> {
    if (!this.isMockMode && this.supabase) {
      const fileName = _url.split('/').pop();
      if (fileName) await this.supabase.storage.from(_bucket).remove([fileName]);
    }
  }
}

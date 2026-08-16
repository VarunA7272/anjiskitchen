import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { SeoService } from '../../core/services/seo.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Review } from '../../core/models/review.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <!-- ─── Hero ──────────────────────────────────────────────────────────── -->
    <section class="hero" aria-label="Hero section">
      <div class="hero-bg">
        <div class="hero-blob blob-1"></div>
        <div class="hero-blob blob-2"></div>
        <div class="hero-blob blob-3"></div>
      </div>
      <div class="hero-floral hero-floral-left">🌸</div>
      <div class="hero-floral hero-floral-right">🌹</div>

      <div class="container hero-inner">
        <div class="hero-content animate-fade-up">
          <span class="eyebrow">✨ Handcrafted in Jabalpur, MP</span>
          <h1 class="hero-title">
            Welcome to<br />
            <span class="brand-name">Anji's Kitchen</span><br />
            <span class="brand-sub">n MORE</span>
          </h1>
          <p class="hero-desc">
            Homemade with love — from kitchen to your doorstep.<br />
            Fresh baked goods, pickles, snacks, cosmetics & more.
          </p>
          <div class="hero-actions">
            <a routerLink="/catalog" class="btn btn-primary btn-lg" id="hero-shop-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"/>
              </svg>
              Shop Now
            </a>
            <a href="https://wa.me/917848827245" target="_blank" rel="noopener" class="btn btn-secondary btn-lg" id="hero-wa-btn">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
              Chat with Us
            </a>
          </div>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat">
              <strong>100+</strong>
              <span>Products</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <strong>500+</strong>
              <span>Happy Customers</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <strong>5★</strong>
              <span>Avg Rating</span>
            </div>
          </div>
        </div>

        <div class="hero-visual animate-fade-up delay-2">
          <div class="hero-logo-wrap animate-float">
            <img src="assets/logo.png" alt="Anji's Kitchen" class="hero-logo-img" />
          </div>
        </div>
      </div>

      <!-- Wave -->
      <div class="hero-wave">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 40 C360 80 1080 0 1440 40 L1440 80 L0 80 Z" fill="#FDF8F4"/>
        </svg>
      </div>
    </section>

    <!-- ─── Categories ─────────────────────────────────────────────────────── -->
    <section class="categories-section section-sm">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Browse by</span>
          <h2>Our Categories</h2>
          <div class="rose-divider"></div>
        </div>
        <div class="categories-scroll">
          <a routerLink="/catalog" class="cat-pill all-pill" id="cat-all">
            <span class="cat-emoji">🛍️</span>
            <span>All Products</span>
          </a>
          @for (cat of categories(); track cat.id) {
            <a
              routerLink="/catalog"
              [queryParams]="{category: cat.slug}"
              class="cat-pill"
              [id]="'cat-' + cat.slug"
            >
              <span class="cat-emoji">{{ getCatEmoji(cat.name) }}</span>
              <span>{{ cat.name }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ─── Featured Products ──────────────────────────────────────────────── -->
    <section class="products-section section">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Freshly Made</span>
          <h2>Featured Products</h2>
          <p>Handpicked bestsellers — cooked with love, delivered fresh</p>
          <div class="rose-divider"></div>
        </div>

        @if (loadingProducts()) {
          <div class="product-grid">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="skeleton skeleton-card"></div>
            }
          </div>
        } @else if (featuredProducts().length === 0) {
          <div class="empty-products">
            <p>🌸 Products coming soon! Check back after the admin uploads products.</p>
          </div>
        } @else {
          <div class="product-grid">
            @for (product of featuredProducts(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }

        <div class="view-all-wrap">
          <a routerLink="/catalog" class="btn btn-secondary" id="home-view-all-btn">
            View All Products
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ─── About Blurb ────────────────────────────────────────────────────── -->
    <section class="about-blurb section-sm">
      <div class="container">
        <div class="about-card glass-card">
          <div class="about-text">
            <span class="eyebrow">Our Story</span>
            <h2>Made with Love,<br /> <span class="text-rose">Straight from Our Kitchen</span></h2>
            <p>
              Anji's Kitchen began as a passion for homemade food — the kind that brings
              warmth, comfort, and nostalgia. Based in Jabalpur, Madhya Pradesh, we craft
              every product by hand using traditional recipes and the finest local ingredients.
            </p>
            <p>
              From our signature baked goods and homemade pickles to natural cosmetics and
              hair accessories — everything we make carries the love of a home kitchen.
            </p>
            <a routerLink="/about" class="btn btn-primary" id="home-about-btn">
              Read Our Story
            </a>
          </div>
          <div class="about-visual">
            <div class="about-logo-frame">
              <img src="assets/logo.png" alt="Anji's Kitchen Story" />
            </div>
            <div class="about-badge">
              <span class="badge-icon">👩‍🍳</span>
              <strong>Homemade</strong>
              <span>with love</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── WhatsApp Banner ────────────────────────────────────────────────── -->
    <section class="wa-banner">
      <div class="container">
        <div class="wa-inner">
          <div class="wa-text">
            <h2>Ready to Order? Chat Directly on WhatsApp!</h2>
            <p>Fast responses • Custom orders welcome • Free delivery within Jabalpur</p>
          </div>
          <a href="https://wa.me/917848827245" target="_blank" rel="noopener" class="btn wa-cta-btn" id="wa-banner-btn">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm.004 18a7.966 7.966 0 0 1-4.07-1.115l-.29-.173-3.004.895.895-3.004-.173-.29A7.967 7.967 0 0 1 4 12.004C4 7.584 7.584 4 12.004 4 16.42 4 20 7.584 20 12.004 20 16.42 16.42 20 12.004 20Zm4.37-5.972c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.013-.373-1.928-1.188-.712-.635-1.193-1.42-1.333-1.66-.14-.24-.015-.37.105-.49.108-.107.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.195-.467-.393-.404-.54-.412l-.46-.008a.882.882 0 0 0-.64.3c-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.693 2.585 4.103 3.625.574.248 1.022.396 1.372.507.576.183 1.1.157 1.514.095.462-.069 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>
            Start WhatsApp Chat
          </a>
        </div>
      </div>
    </section>

    <!-- ─── Testimonials ───────────────────────────────────────────────────── -->
    @if (reviews().length > 0) {
      <section class="testimonials section">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">What Customers Say</span>
            <h2>Loved by Our Community</h2>
            <div class="rose-divider"></div>
          </div>
          <div class="reviews-grid">
            @for (review of reviews(); track review.id) {
              <div class="review-card glass-card">
                <div class="review-stars">
                  @for (_ of getStars(review.rating); track $index) {
                    <span class="star">★</span>
                  }
                </div>
                <p class="review-text">"{{ review.message }}"</p>
                <div class="reviewer">
                  <div class="reviewer-avatar">{{ review.customer_name.charAt(0) }}</div>
                  <div>
                    <strong class="reviewer-name">{{ review.customer_name }}</strong>
                    @if (review.product_name) {
                      <span class="reviewer-product">re: {{ review.product_name }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="view-all-wrap">
            <a routerLink="/reviews" class="btn btn-secondary" id="home-all-reviews-btn">See All Reviews</a>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    /* ── Hero ── */
    .hero {
      min-height: 100vh;
      position: relative;
      background: var(--gradient-hero);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding-top: 80px;
    }

    .hero-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }

    .hero-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.35;
    }

    .blob-1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, #F4A6C4, transparent 70%);
      top: -200px; left: -100px;
      animation: float 8s ease-in-out infinite;
    }

    .blob-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #E3C97A, transparent 70%);
      top: 30%; right: -150px;
      animation: float 10s ease-in-out infinite reverse;
    }

    .blob-3 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #E8699A, transparent 70%);
      bottom: -200px; left: 40%;
      opacity: 0.2;
      animation: float 12s ease-in-out infinite;
    }

    .hero-floral {
      position: absolute;
      font-size: 4rem;
      z-index: 1;
      opacity: 0.4;
    }
    .hero-floral-left { left: 2%; top: 25%; animation: float 6s ease-in-out infinite; }
    .hero-floral-right { right: 3%; top: 40%; animation: float 7s ease-in-out infinite reverse; }

    .hero-inner {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
      padding-top: 3rem;
      padding-bottom: 5rem;
      position: relative;
      z-index: 2;
    }

    @media (max-width: 768px) {
      .hero-inner { grid-template-columns: 1fr; text-align: center; }
      .hero-visual { display: none; }
    }

    .hero-content { max-width: 580px; }

    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(2.75rem, 6vw, 5rem);
      font-weight: 800;
      line-height: 1.1;
      color: var(--text-dark);
      margin: 1rem 0;
    }

    .brand-name {
      background: var(--gradient-rose);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-sub {
      font-size: 0.65em;
      background: var(--gradient-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-desc {
      font-size: 1.0625rem;
      color: var(--text-mid);
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .stat { text-align: center; }
    .stat strong { display: block; font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--rose); }
    .stat span { font-size: 0.8125rem; color: var(--text-light); }
    .stat-divider { width: 1px; height: 32px; background: var(--border); }

    .hero-visual { display: flex; align-items: center; justify-content: center; }

    .hero-logo-wrap {
      position: relative;
      width: 420px; height: 420px;
      display: flex; align-items: center; justify-content: center;
    }

    .hero-logo-img {
      width: 100%; height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 20px 60px rgba(232,105,154,0.25));
    }

    .hero-wave {
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      z-index: 3;
    }

    /* ── Categories ── */
    .categories-section { background: var(--bg-cream); }

    .categories-scroll {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .categories-scroll::-webkit-scrollbar { display: none; }

    .cat-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: var(--radius-full);
      background: var(--glass-bg);
      border: 1.5px solid var(--border);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-mid);
      white-space: nowrap;
      transition: all var(--transition-base);
      backdrop-filter: blur(8px);
    }

    .cat-pill:hover, .all-pill {
      background: var(--gradient-rose);
      border-color: transparent;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(232, 105, 154, 0.3);
    }

    .cat-emoji { font-size: 1.2rem; }

    /* ── Products ── */
    .products-section { background: var(--bg-warm); }
    .view-all-wrap { display: flex; justify-content: center; margin-top: var(--space-lg); }

    .empty-products {
      text-align: center;
      padding: var(--space-2xl);
      color: var(--text-light);
      font-size: 1.0625rem;
    }

    /* ── About Blurb ── */
    .about-blurb { background: var(--bg-cream); }

    .about-card {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 3rem;
      align-items: center;
      padding: 3rem;
    }

    @media (max-width: 768px) {
      .about-card { grid-template-columns: 1fr; text-align: center; }
      .about-visual { display: flex; flex-direction: column; align-items: center; }
    }

    .about-text { max-width: 580px; }
    .about-text h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); margin: 0.75rem 0 1.25rem; line-height: 1.25; }
    .about-text p { color: var(--text-mid); line-height: 1.75; margin-bottom: 1rem; font-size: 0.9875rem; }

    .about-visual { position: relative; }

    .about-logo-frame {
      width: 260px; height: 260px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(232, 105, 154, 0.2);
      box-shadow: var(--shadow-lg);
      background: var(--bg-warm);
      display: flex; align-items: center; justify-content: center;
    }

    .about-logo-frame img { width: 100%; height: 100%; object-fit: contain; padding: 1rem; }

    .about-badge {
      position: absolute;
      bottom: 10px; right: -10px;
      background: var(--gradient-gold);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
      box-shadow: var(--shadow-md);
    }

    .badge-icon { font-size: 1.5rem; }
    .about-badge strong { font-family: var(--font-heading); font-size: 0.9rem; color: var(--text-dark); }
    .about-badge span { font-size: 0.75rem; color: var(--text-mid); }

    /* ── WhatsApp Banner ── */
    .wa-banner {
      background: linear-gradient(135deg, #075E54, #128C7E);
      padding: 3rem 0;
    }

    .wa-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) { .wa-inner { text-align: center; justify-content: center; } }

    .wa-text h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.25rem, 2.5vw, 1.875rem);
      color: #fff;
      margin-bottom: 0.375rem;
    }

    .wa-text p { color: rgba(255,255,255,0.75); font-size: 0.9375rem; }

    .wa-cta-btn {
      background: #25D366;
      color: #fff;
      font-size: 1.0625rem;
      padding: 0.875rem 2rem;
      box-shadow: 0 6px 24px rgba(0,0,0,0.25);
      flex-shrink: 0;
    }

    .wa-cta-btn:hover {
      background: #1ebe58;
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(0,0,0,0.3);
    }

    /* ── Reviews ── */
    .testimonials { background: var(--bg-cream); }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 900px) { .reviews-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 580px) { .reviews-grid { grid-template-columns: 1fr; } }

    .review-card {
      padding: 1.75rem;
      background: #fff;
    }

    .review-stars { display: flex; gap: 2px; color: var(--gold); margin-bottom: 0.875rem; font-size: 1.125rem; }

    .review-text {
      font-size: 0.9375rem;
      color: var(--text-mid);
      line-height: 1.7;
      margin-bottom: 1.25rem;
      font-style: italic;
    }

    .reviewer { display: flex; align-items: center; gap: 0.75rem; }

    .reviewer-avatar {
      width: 40px; height: 40px;
      border-radius: var(--radius-full);
      background: var(--gradient-rose);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .reviewer-name { display: block; font-weight: 600; font-size: 0.9rem; color: var(--text-dark); }
    .reviewer-product { display: block; font-size: 0.8rem; color: var(--text-light); }
  `]
})
export class HomeComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private seo = inject(SeoService);

  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  reviews = signal<Review[]>([]);
  loadingProducts = signal(true);

  readonly catEmojiMap: Record<string, string> = {
    'baked goods': '🧁', 'pickles': '🫙', 'snacks': '🍪',
    'cosmetics': '💄', 'homemade food': '🍱', 'hair': '🧡',
    'sweets': '🍮', 'beverages': '🥤',
  };

  getCatEmoji(name: string): string {
    const key = Object.keys(this.catEmojiMap).find(k => name.toLowerCase().includes(k));
    return key ? this.catEmojiMap[key] : '✨';
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  async ngOnInit() {
    this.seo.setPage({
      title: "Anji's Kitchen n MORE — Homemade Food, Baked Goods & More from Jabalpur",
      description: "Shop handcrafted homemade food, baked goods, pickles, snacks & cosmetics from Anji's Kitchen in Jabalpur. Order via WhatsApp!",
      keywords: "anji's kitchen, homemade food jabalpur, baked goods, pickles, snacks, cosmetics jabalpur",
    });

    await Promise.all([
      this.loadProducts(),
      this.loadCategories(),
      this.loadReviews(),
    ]);
  }

  private async loadProducts() {
    try {
      this.loadingProducts.set(true);
      const products = await this.supabase.getProducts({ featured: true, limit: 10 });
      this.featuredProducts.set(products);
    } catch {
      this.featuredProducts.set([]);
    } finally {
      this.loadingProducts.set(false);
    }
  }

  private async loadCategories() {
    try {
      const cats = await this.supabase.getCategories();
      this.categories.set(cats);
    } catch {
      this.categories.set([]);
    }
  }

  private async loadReviews() {
    try {
      const reviews = await this.supabase.getApprovedReviews();
      this.reviews.set(reviews.slice(0, 3));
    } catch {
      this.reviews.set([]);
    }
  }
}

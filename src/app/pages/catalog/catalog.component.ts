import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductDetailModalComponent } from './product-detail-modal.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { SeoService } from '../../core/services/seo.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, ProductDetailModalComponent],
  template: `
    <div class="catalog-page">
      <!-- Page Header -->
      <div class="catalog-header">
        <div class="catalog-header-bg"></div>
        <div class="container">
          <span class="eyebrow">Browse Everything</span>
          <h1>Our Products</h1>
          <p>Handcrafted with love — discover our full range</p>
        </div>
      </div>

      <div class="container catalog-body">
        <!-- Filters & Search Bar -->
        <div class="toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              class="search-input"
              placeholder="Search products..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
              id="catalog-search"
              aria-label="Search products"
            />
          </div>

          <div class="results-info">
            {{ filteredProducts().length }} product{{ filteredProducts().length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Category Filters -->
        <div class="cat-filters">
          <button
            class="cat-filter-btn"
            [class.active]="activeCategory() === ''"
            (click)="setCategory('')"
            id="filter-all"
          >All</button>
          @for (cat of categories(); track cat.id) {
            <button
              class="cat-filter-btn"
              [class.active]="activeCategory() === cat.slug"
              (click)="setCategory(cat.slug)"
              [id]="'filter-' + cat.slug"
            >{{ cat.name }}</button>
          }
        </div>

        <!-- Products Grid -->
        @if (loading()) {
          <div class="product-grid">
            @for (_ of skeletons; track $index) {
              <div class="skeleton skeleton-card"></div>
            }
          </div>
        } @else if (filteredProducts().length === 0) {
          <div class="empty-state">
            <div class="empty-emoji">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
            <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Clear filters</button>
          </div>
        } @else {
          <div class="product-grid">
            @for (product of visibleProducts(); track product.id) {
              <app-product-card
                [product]="product"
                (click)="openModal(product)"
              />
            }
          </div>

          <!-- Infinite scroll trigger / Load more -->
          @if (visibleProducts().length < filteredProducts().length) {
            <div class="load-more-wrap">
              <button class="btn btn-secondary" (click)="loadMore()" id="load-more-btn">
                Load More
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
              </button>
            </div>
          }
        }
      </div>

      <!-- Product Detail Modal -->
      @if (selectedProduct()) {
        <app-product-detail-modal
          [product]="selectedProduct()!"
          (close)="closeModal()"
        />
      }
    </div>
  `,
  styles: [`
    .catalog-page { min-height: 100vh; padding-top: 72px; }

    .catalog-header {
      position: relative;
      background: linear-gradient(135deg, #FDF8F4 0%, #FEF0F5 100%);
      padding: 3rem 0 2rem;
      text-align: center;
      overflow: hidden;
    }

    .catalog-header-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(232,105,154,0.12) 0%, transparent 60%);
    }

    .catalog-header .container { position: relative; }
    .catalog-header h1 { font-family: var(--font-heading); font-size: clamp(2rem,4vw,3rem); font-weight: 800; color: var(--text-dark); margin: 0.5rem 0; }
    .catalog-header p { color: var(--text-light); font-size: 1rem; }

    .catalog-body { padding-top: 2.5rem; padding-bottom: 5rem; }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 240px;
    }

    .search-icon {
      position: absolute;
      left: 1rem; top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border);
      background: #fff;
      font-size: 0.9375rem;
      color: var(--text-dark);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--rose);
      box-shadow: 0 0 0 3px rgba(232,105,154,0.12);
    }

    .results-info {
      font-size: 0.875rem;
      color: var(--text-light);
      white-space: nowrap;
    }

    .cat-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .cat-filter-btn {
      padding: 0.5rem 1.125rem;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border);
      background: #fff;
      color: var(--text-mid);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .cat-filter-btn:hover, .cat-filter-btn.active {
      background: var(--gradient-rose);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 4px 14px rgba(232,105,154,0.3);
    }

    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
    }

    .empty-emoji { font-size: 3.5rem; margin-bottom: 1rem; }
    .empty-state h3 { font-family: var(--font-heading); font-size: 1.5rem; color: var(--text-dark); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-light); margin-bottom: 1.5rem; }

    .load-more-wrap { display: flex; justify-content: center; margin-top: 2.5rem; }
  `]
})
export class CatalogComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  searchQuery = '';
  activeCategory = signal('');
  pageSize = 20;
  currentPage = signal(1);
  selectedProduct = signal<Product | null>(null);
  skeletons = Array(10);

  filteredProducts = computed(() => {
    let list = this.products();
    if (this.activeCategory()) {
      list = list.filter(p => p.category?.slug === this.activeCategory());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return list;
  });

  visibleProducts = computed(() =>
    this.filteredProducts().slice(0, this.currentPage() * this.pageSize)
  );

  async ngOnInit() {
    this.seo.setPage({
      title: 'Shop All Products',
      description: "Browse all products from Anji's Kitchen — baked goods, pickles, snacks, cosmetics, and more.",
    });

    this.route.queryParams.subscribe(params => {
      if (params['category']) this.activeCategory.set(params['category']);
    });

    await Promise.all([this.loadProducts(), this.loadCategories()]);
  }

  private async loadProducts() {
    try {
      this.loading.set(true);
      const products = await this.supabase.getProducts({ limit: 200 });
      this.products.set(products);
    } catch {
      this.products.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCategories() {
    try {
      const cats = await this.supabase.getCategories();
      this.categories.set(cats);
    } catch {}
  }

  setCategory(slug: string) {
    this.activeCategory.set(slug);
    this.currentPage.set(1);
  }

  onSearch() { this.currentPage.set(1); }
  loadMore() { this.currentPage.update(v => v + 1); }
  resetFilters() { this.searchQuery = ''; this.activeCategory.set(''); this.currentPage.set(1); }

  openModal(product: Product) { this.selectedProduct.set(product); }
  closeModal() { this.selectedProduct.set(null); }
}

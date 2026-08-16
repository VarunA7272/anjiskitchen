import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <article class="product-card glass-card" [attr.aria-label]="product.name">
      <!-- Badge -->
      @if (product.is_featured) {
        <span class="featured-badge">⭐ Featured</span>
      }
      @if (product.original_price && product.original_price > product.price) {
        <span class="sale-badge">SALE</span>
      }

      <!-- Image -->
      <div class="card-image" (click)="openDetail()">
        <img
          [src]="product.images[0] || 'assets/placeholder.jpg'"
          [alt]="product.name"
          loading="lazy"
          class="product-img"
        />
        <div class="image-overlay">
          <button class="quick-view-btn" (click)="openDetail()" aria-label="Quick view">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
            Quick View
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="card-content">
        @if (product.category) {
          <span class="card-category">{{ product.category.name }}</span>
        }
        <h3 class="card-name">
          <a [routerLink]="['/catalog', product.slug]">{{ product.name }}</a>
        </h3>
        <p class="card-desc">{{ product.description | slice:0:60 }}{{ product.description.length > 60 ? '...' : '' }}</p>

        <div class="card-footer">
          <div class="price-block">
            <span class="price">₹{{ product.price }}</span>
            @if (product.original_price && product.original_price > product.price) {
              <span class="original-price">₹{{ product.original_price }}</span>
            }
          </div>
          <button
            class="add-btn"
            (click)="addToCart($event)"
            [class.added]="justAdded()"
            [attr.aria-label]="'Add ' + product.name + ' to cart'"
            id="add-to-cart-{{product.id}}"
          >
            @if (justAdded()) {
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
              </svg>
            } @else {
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
            }
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--glass-bg);
      border: 1px solid var(--border);
      transition: all var(--transition-slow);
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
      border-color: var(--border-hover);
    }

    .featured-badge {
      position: absolute;
      top: 10px; left: 10px;
      z-index: 2;
      background: var(--gradient-gold);
      color: var(--text-dark);
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.2rem 0.625rem;
      border-radius: var(--radius-full);
    }

    .sale-badge {
      position: absolute;
      top: 10px; right: 10px;
      z-index: 2;
      background: var(--gradient-rose);
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.2rem 0.625rem;
      border-radius: var(--radius-full);
    }

    .card-image {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--bg-warm);
    }

    .product-img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-card:hover .product-img {
      transform: scale(1.06);
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(44, 26, 18, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    .product-card:hover .image-overlay {
      opacity: 1;
    }

    .quick-view-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      background: rgba(255,255,255,0.9);
      color: var(--text-dark);
      font-size: 0.8125rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      transform: translateY(8px);
      transition: all var(--transition-base);
    }

    .product-card:hover .quick-view-btn {
      transform: translateY(0);
    }

    .quick-view-btn:hover { background: #fff; }

    .card-content {
      padding: 0.875rem;
    }

    .card-category {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--gold-dark);
      margin-bottom: 0.25rem;
      display: block;
    }

    .card-name {
      font-family: var(--font-heading);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 0.25rem;
      line-height: 1.3;
    }

    .card-name a:hover { color: var(--rose); }

    .card-desc {
      font-size: 0.75rem;
      color: var(--text-light);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .price-block { display: flex; align-items: baseline; gap: 0.375rem; }

    .price {
      font-family: var(--font-heading);
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--rose);
    }

    .original-price {
      font-size: 0.8125rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .add-btn {
      width: 34px; height: 34px;
      border-radius: var(--radius-full);
      background: var(--gradient-rose);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-base);
      box-shadow: 0 3px 12px rgba(232, 105, 154, 0.35);
      flex-shrink: 0;
    }

    .add-btn:hover {
      transform: scale(1.12);
      box-shadow: 0 5px 18px rgba(232, 105, 154, 0.5);
    }

    .add-btn.added {
      background: linear-gradient(135deg, #48bb78, #276749);
      box-shadow: 0 3px 12px rgba(72, 187, 120, 0.4);
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cart = inject(CartService);
  justAdded = signal(false);

  addToCart(event: Event) {
    event.stopPropagation();
    this.cart.addItem(this.product);
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 1800);
  }

  openDetail() {
    // Navigation handled by router in parent
  }
}

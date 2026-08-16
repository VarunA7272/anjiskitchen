import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [],
  template: `
    <!-- Overlay -->
    <div class="modal-overlay" (click)="onClose()" role="button" tabindex="0" aria-label="Close modal" (keydown.escape)="onClose()"></div>

    <!-- Modal -->
    <div class="modal-panel" role="dialog" aria-modal="true" [attr.aria-label]="product.name">
      <!-- Close -->
      <button class="modal-close" (click)="onClose()" aria-label="Close">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="modal-body">
        <!-- Image Carousel -->
        <div class="modal-images">
          <div class="main-image">
            <img [src]="currentImage()" [alt]="product.name" class="main-img" />
            @if (product.images.length > 1) {
              <button class="nav-btn prev" (click)="prevImage()" aria-label="Previous image">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                </svg>
              </button>
              <button class="nav-btn next" (click)="nextImage()" aria-label="Next image">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                </svg>
              </button>
            }
            @if (product.is_featured) {
              <span class="img-badge">⭐ Featured</span>
            }
          </div>

          @if (product.images.length > 1) {
            <div class="thumbnails">
              @for (img of product.images; track $index) {
                <button
                  class="thumb"
                  [class.active]="currentIndex() === $index"
                  (click)="setImage($index)"
                  [attr.aria-label]="'View image ' + ($index + 1)"
                >
                  <img [src]="img" [alt]="product.name + ' image ' + ($index + 1)" loading="lazy" />
                </button>
              }
            </div>
          }
        </div>

        <!-- Product Info -->
        <div class="modal-info">
          @if (product.category) {
            <span class="cat-tag">{{ product.category.name }}</span>
          }
          <h2 class="product-title">{{ product.name }}</h2>

          <!-- Price -->
          <div class="price-row">
            <span class="modal-price">₹{{ product.price }}</span>
            @if (product.original_price && product.original_price > product.price) {
              <span class="modal-original">₹{{ product.original_price }}</span>
              <span class="discount-badge">
                {{ Math.round((1 - product.price / product.original_price) * 100) }}% OFF
              </span>
            }
          </div>

          <!-- Description -->
          <p class="modal-desc">{{ product.description }}</p>

          <!-- Size Selector -->
          @if (product.sizes && product.sizes.length > 0) {
            <div class="size-section">
              <label class="size-label">Size / Variant</label>
              <div class="size-options">
                @for (size of product.sizes; track size) {
                  <button
                    class="size-btn"
                    [class.selected]="selectedSize() === size"
                    (click)="selectedSize.set(size)"
                    [attr.aria-pressed]="selectedSize() === size"
                  >{{ size }}</button>
                }
              </div>
            </div>
          }

          <!-- Quantity -->
          <div class="qty-section">
            <label class="size-label">Quantity</label>
            <div class="qty-row">
              <div class="qty-control-large">
                <button (click)="decQty()" aria-label="Decrease">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" d="M5 12h14"/></svg>
                </button>
                <span>{{ qty() }}</span>
                <button (click)="incQty()" aria-label="Increase">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              <span class="total-line">Total: <strong>₹{{ product.price * qty() }}</strong></span>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button
              class="btn btn-primary btn-lg add-to-cart-main"
              (click)="addToCart()"
              [class.added]="justAdded()"
              id="modal-add-to-cart"
            >
              @if (justAdded()) {
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </svg>
                Added to Cart!
              } @else {
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"/>
                </svg>
                Add to Cart
              }
            </button>

            <a
              [href]="'https://wa.me/917848827245?text=' + whatsAppMsg()"
              target="_blank"
              rel="noopener"
              class="btn wa-direct-btn"
              id="modal-wa-direct"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
              Buy via WhatsApp
            </a>
          </div>

          <!-- Tags -->
          @if (product.tags && product.tags.length > 0) {
            <div class="tags">
              @for (tag of product.tags; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(44, 26, 18, 0.6);
      backdrop-filter: blur(6px);
      z-index: calc(var(--z-modal) - 1);
      animation: fade-in 0.25s ease;
    }

    .modal-panel {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: var(--z-modal);
      width: min(920px, 96vw);
      max-height: 92vh;
      background: #fff;
      border-radius: var(--radius-xl);
      overflow-y: auto;
      box-shadow: 0 40px 120px rgba(0,0,0,0.3);
      animation: fade-in-up 0.35s ease;
    }

    .modal-close {
      position: sticky;
      top: 1rem;
      float: right;
      margin: 1rem 1rem 0 0;
      width: 36px; height: 36px;
      border-radius: var(--radius-full);
      background: rgba(232,105,154,0.1);
      color: var(--rose);
      display: flex; align-items: center; justify-content: center;
      z-index: 10;
      transition: all var(--transition-fast);
    }

    .modal-close:hover { background: rgba(232,105,154,0.2); }

    .modal-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    @media (max-width: 680px) {
      .modal-body { grid-template-columns: 1fr; }
    }

    /* Image */
    .main-image {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-warm);
    }

    .main-img { width: 100%; height: 100%; object-fit: cover; }

    .nav-btn {
      position: absolute;
      top: 50%; transform: translateY(-50%);
      width: 36px; height: 36px;
      border-radius: var(--radius-full);
      background: rgba(255,255,255,0.9);
      color: var(--text-dark);
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
    }

    .nav-btn:hover { background: #fff; transform: translateY(-50%) scale(1.05); }
    .nav-btn.prev { left: 0.75rem; }
    .nav-btn.next { right: 0.75rem; }

    .img-badge {
      position: absolute;
      top: 0.75rem; left: 0.75rem;
      background: var(--gradient-gold);
      color: var(--text-dark);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-full);
    }

    .thumbnails {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }

    .thumb {
      width: 64px; height: 64px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb.active { border-color: var(--rose); box-shadow: 0 0 0 1px var(--rose); }
    .thumb:hover { border-color: var(--rose-light); }

    /* Info */
    .cat-tag {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gold-dark);
      margin-bottom: 0.5rem;
      display: block;
    }

    .product-title {
      font-family: var(--font-heading);
      font-size: clamp(1.375rem, 2.5vw, 1.875rem);
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 1rem;
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .modal-price {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 800;
      color: var(--rose);
    }

    .modal-original {
      font-size: 1.125rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .discount-badge {
      background: rgba(232,105,154,0.12);
      color: var(--rose-dark);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-full);
    }

    .modal-desc {
      color: var(--text-mid);
      line-height: 1.75;
      margin-bottom: 1.5rem;
      font-size: 0.9375rem;
    }

    .size-section, .qty-section { margin-bottom: 1.25rem; }

    .size-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-mid);
      margin-bottom: 0.5rem;
    }

    .size-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .size-btn {
      padding: 0.4375rem 1rem;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: #fff;
      color: var(--text-mid);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .size-btn:hover { border-color: var(--rose-light); color: var(--rose); }
    .size-btn.selected { background: var(--gradient-rose); border-color: transparent; color: #fff; }

    .qty-row { display: flex; align-items: center; gap: 1rem; }

    .qty-control-large {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .qty-control-large button {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-mid);
      transition: all var(--transition-fast);
    }

    .qty-control-large button:hover { background: rgba(232,105,154,0.08); color: var(--rose); }

    .qty-control-large span {
      min-width: 48px;
      text-align: center;
      font-size: 1rem;
      font-weight: 600;
    }

    .total-line { color: var(--text-mid); font-size: 0.9375rem; }
    .total-line strong { color: var(--rose); font-size: 1.0625rem; }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .add-to-cart-main {
      flex: 1;
      justify-content: center;
      min-width: 160px;
    }

    .add-to-cart-main.added {
      background: linear-gradient(135deg, #48bb78, #276749);
      box-shadow: 0 4px 20px rgba(72, 187, 120, 0.35);
    }

    .wa-direct-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #fff;
      font-size: 0.9375rem;
      font-weight: 600;
      transition: all var(--transition-base);
      box-shadow: 0 4px 16px rgba(37,211,102,0.3);
    }

    .wa-direct-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.4); }

    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .tag {
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-full);
      background: rgba(232,105,154,0.08);
      color: var(--rose-dark);
      font-size: 0.75rem;
      font-weight: 500;
    }
  `]
})
export class ProductDetailModalComponent {
  @Input({ required: true }) product!: Product;
  @Output() close = new EventEmitter<void>();

  protected Math = Math;
  private cart = inject(CartService);

  currentIndex = signal(0);
  selectedSize = signal<string | undefined>(undefined);
  qty = signal(1);
  justAdded = signal(false);

  currentImage = () => this.product.images[this.currentIndex()] || 'assets/placeholder.jpg';

  setImage(i: number) { this.currentIndex.set(i); }
  prevImage() { this.currentIndex.update(i => (i - 1 + this.product.images.length) % this.product.images.length); }
  nextImage() { this.currentIndex.update(i => (i + 1) % this.product.images.length); }
  incQty() { this.qty.update(v => v + 1); }
  decQty() { this.qty.update(v => Math.max(1, v - 1)); }

  onClose() { this.close.emit(); }

  addToCart() {
    this.cart.addItem(this.product, this.qty(), this.selectedSize());
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 1800);
  }

  whatsAppMsg() {
    const size = this.selectedSize() ? ` (${this.selectedSize()})` : '';
    const msg = `Hi! I'd like to order:\n• ${this.product.name}${size} × ${this.qty()} = ₹${this.product.price * this.qty()}\n\nPlease confirm availability. Thank you! 🙏`;
    return encodeURIComponent(msg);
  }
}

import { Component, computed, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart-item.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [],
  template: `
    <!-- Overlay -->
    @if (isOpen()) {
      <div class="cart-overlay" (click)="closeCart()" aria-label="Close cart"></div>
    }

    <!-- Drawer -->
    <aside class="cart-drawer" [class.open]="isOpen()" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <!-- Header -->
      <div class="drawer-header">
        <div class="drawer-title">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"/>
          </svg>
          <span>Your Cart</span>
          @if (itemCount() > 0) {
            <span class="item-count">{{ itemCount() }}</span>
          }
        </div>
        <button class="close-btn" (click)="closeCart()" aria-label="Close">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      @if (items().length === 0) {
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Discover our homemade delights</p>
          <button class="btn btn-primary btn-sm" (click)="closeCart()">Browse Products</button>
        </div>
      }

      <!-- Cart Items -->
      @if (items().length > 0) {
        <div class="drawer-items">
          @for (item of items(); track item.product.id + (item.selectedSize ?? '')) {
            <div class="cart-item">
              <div class="item-image">
                <img
                  [src]="item.product.images[0] || 'assets/placeholder.jpg'"
                  [alt]="item.product.name"
                  loading="lazy"
                />
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.product.name }}</h4>
                @if (item.selectedSize) {
                  <span class="item-size">Size: {{ item.selectedSize }}</span>
                }
                <span class="item-price">₹{{ item.product.price }}</span>
              </div>
              <div class="item-controls">
                <div class="qty-control">
                  <button (click)="decrease(item)" aria-label="Decrease quantity">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" d="M5 12h14"/>
                    </svg>
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="increase(item)" aria-label="Increase quantity">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
                <button class="remove-btn" (click)="remove(item)" aria-label="Remove item">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          <div class="total-row">
            <span>Subtotal</span>
            <span class="total-price">₹{{ total() }}</span>
          </div>
          <p class="delivery-note">🚚 Delivery charges calculated on order confirmation</p>

          <button class="btn btn-primary whatsapp-order-btn" (click)="placeOrder()" id="whatsapp-order-btn">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
            Order via WhatsApp
          </button>

          <button class="btn btn-ghost btn-sm clear-btn" (click)="clearCart()">Clear cart</button>
        </div>
      }
    </aside>
  `,
  styles: [`
    .cart-overlay {
      position: fixed;
      inset: 0;
      background: rgba(44, 26, 18, 0.5);
      backdrop-filter: blur(4px);
      z-index: calc(var(--z-drawer) - 1);
      animation: fade-in 0.25s ease;
    }

    .cart-drawer {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(420px, 100vw);
      background: #fff;
      z-index: var(--z-drawer);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -8px 0 48px rgba(232, 105, 154, 0.15);
    }

    .cart-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, rgba(248,240,245,0.8), rgba(255,255,255,0.9));
    }

    .drawer-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-dark);
    }

    .item-count {
      background: var(--gradient-rose);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
    }

    .close-btn {
      width: 36px; height: 36px;
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-light);
      background: transparent;
      transition: all var(--transition-fast);
    }
    .close-btn:hover { background: rgba(232, 105, 154, 0.1); color: var(--rose); }

    /* Empty State */
    .empty-cart {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .empty-icon { font-size: 3.5rem; }
    .empty-cart h3 { font-family: var(--font-heading); font-size: 1.25rem; color: var(--text-dark); }
    .empty-cart p { color: var(--text-light); font-size: 0.9375rem; }

    /* Items List */
    .drawer-items {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 72px 1fr auto;
      gap: 0.75rem;
      align-items: center;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      background: rgba(253, 248, 244, 0.7);
      border: 1px solid var(--border);
      transition: border-color var(--transition-fast);
    }

    .cart-item:hover { border-color: var(--border-hover); }

    .item-image {
      width: 72px; height: 72px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%; height: 100%;
      object-fit: cover;
    }

    .item-info { flex: 1; min-width: 0; }

    .item-name {
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-size {
      font-size: 0.75rem;
      color: var(--text-light);
      display: block;
    }

    .item-price {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--rose);
    }

    .item-controls {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .qty-control button {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-mid);
      transition: all var(--transition-fast);
    }

    .qty-control button:hover { background: rgba(232, 105, 154, 0.1); color: var(--rose); }

    .qty-control span {
      min-width: 28px;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .remove-btn {
      color: var(--text-muted);
      transition: color var(--transition-fast);
      padding: 4px;
    }
    .remove-btn:hover { color: #e53e3e; }

    /* Footer */
    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border);
      background: rgba(253, 248, 244, 0.5);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .total-price {
      font-family: var(--font-heading);
      font-size: 1.375rem;
      color: var(--rose);
    }

    .delivery-note {
      font-size: 0.8125rem;
      color: var(--text-light);
      text-align: center;
    }

    .whatsapp-order-btn {
      width: 100%;
      justify-content: center;
      background: linear-gradient(135deg, #25D366, #128C7E);
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
    }

    .whatsapp-order-btn:hover {
      box-shadow: 0 8px 28px rgba(37, 211, 102, 0.4);
    }

    .clear-btn {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8125rem;
    }
    .clear-btn:hover { color: #e53e3e; }
  `]
})
export class CartDrawerComponent {
  private cart = inject(CartService);

  isOpen = this.cart.isOpen;
  items = this.cart.items;
  itemCount = this.cart.totalItems;
  total = this.cart.totalPrice;

  closeCart() { this.cart.closeCart(); }
  increase(item: CartItem) { this.cart.updateQuantity(item.product.id, item.quantity + 1, item.selectedSize); }
  decrease(item: CartItem) { this.cart.updateQuantity(item.product.id, item.quantity - 1, item.selectedSize); }
  remove(item: CartItem) { this.cart.removeItem(item.product.id, item.selectedSize); }
  clearCart() { this.cart.clearCart(); }
  placeOrder() { this.cart.sendWhatsAppOrder(); }
}

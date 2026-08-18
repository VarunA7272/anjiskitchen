import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CartDrawerComponent],
  template: `
    @if (!isAdminPage()) {
      <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="navbar-inner">
        <!-- Logo -->
        <a routerLink="/" class="navbar-logo" aria-label="Anji's Kitchen Home">
          <img src="assets/logo.png" alt="Anji's Kitchen" class="logo-img" />
        </a>

        <!-- Desktop Nav Links -->
        <ul class="navbar-links hide-mobile">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/catalog" routerLinkActive="active">Shop</a></li>
          <li><a routerLink="/about" routerLinkActive="active">About</a></li>
          <li><a routerLink="/reviews" routerLinkActive="active">Reviews</a></li>
          <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
        </ul>

        <!-- Actions -->
        <div class="navbar-actions">
          <!-- WhatsApp quick link -->
          <a href="https://wa.me/917848827245" target="_blank" rel="noopener" class="wa-btn hide-mobile" aria-label="Chat on WhatsApp">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm.004 18a7.966 7.966 0 0 1-4.07-1.115l-.29-.173-3.004.895.895-3.004-.173-.29A7.967 7.967 0 0 1 4 12.004C4 7.584 7.584 4 12.004 4 16.42 4 20 7.584 20 12.004 20 16.42 16.42 20 12.004 20Zm4.37-5.972c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.013-.373-1.928-1.188-.712-.635-1.193-1.42-1.333-1.66-.14-.24-.015-.37.105-.49.108-.107.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.195-.467-.393-.404-.54-.412l-.46-.008a.882.882 0 0 0-.64.3c-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.693 2.585 4.103 3.625.574.248 1.022.396 1.372.507.576.183 1.1.157 1.514.095.462-.069 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>
            <span>WhatsApp</span>
          </a>

          <!-- Cart Button -->
          <button class="cart-btn" (click)="toggleCart()" aria-label="Open cart" id="cart-toggle-btn">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z"/>
            </svg>
            @if (cartCount() > 0) {
              <span class="cart-badge">{{ cartCount() > 9 ? '9+' : cartCount() }}</span>
            }
          </button>

          <!-- Mobile hamburger -->
          <button class="hamburger show-mobile" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Toggle menu">
            <span class="ham-line" [class.open]="menuOpen()"></span>
            <span class="ham-line" [class.open]="menuOpen()"></span>
            <span class="ham-line" [class.open]="menuOpen()"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="mobile-menu animate-fade-in">
          <ul>
            <li><a routerLink="/" (click)="closeMenu()">Home</a></li>
            <li><a routerLink="/catalog" (click)="closeMenu()">Shop</a></li>
            <li><a routerLink="/about" (click)="closeMenu()">About</a></li>
            <li><a routerLink="/reviews" (click)="closeMenu()">Reviews</a></li>
            <li><a routerLink="/contact" (click)="closeMenu()">Contact</a></li>
          </ul>
          <a href="https://wa.me/917848827245" target="_blank" class="btn btn-primary btn-sm wa-mobile">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      }
    </nav>

    <!-- Cart Drawer -->
    <app-cart-drawer />
    }
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: var(--z-nav);
      padding: 0 clamp(1rem, 4vw, 4rem);
      background: transparent;
      transition: background var(--transition-slow), box-shadow var(--transition-slow);
    }

    .navbar.scrolled {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid var(--glass-border);
    }

    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      max-width: 1440px;
      margin-inline: auto;
    }

    .navbar-logo {
      flex-shrink: 0;
    }
    .logo-img {
      height: 52px;
      width: auto;
      object-fit: contain;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }

    .navbar-links a {
      font-family: var(--font-body);
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-mid);
      transition: color var(--transition-fast);
      position: relative;
    }

    .navbar-links a::after {
      content: '';
      position: absolute;
      bottom: -4px; left: 0; right: 0;
      height: 2px;
      background: var(--gradient-rose);
      border-radius: 1px;
      transform: scaleX(0);
      transition: transform var(--transition-base);
    }

    .navbar-links a:hover,
    .navbar-links a.active {
      color: var(--rose);
    }

    .navbar-links a.active::after,
    .navbar-links a:hover::after {
      transform: scaleX(1);
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .wa-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      background: rgba(37, 211, 102, 0.1);
      color: #1a8a40;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      border: 1px solid rgba(37, 211, 102, 0.2);
    }

    .wa-btn:hover {
      background: rgba(37, 211, 102, 0.18);
      transform: translateY(-1px);
    }

    .cart-btn {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full);
      background: rgba(232, 105, 154, 0.1);
      color: var(--rose);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      border: 1px solid rgba(232, 105, 154, 0.2);
    }

    .cart-btn:hover {
      background: rgba(232, 105, 154, 0.18);
      transform: translateY(-1px);
    }

    .cart-badge {
      position: absolute;
      top: -4px; right: -4px;
      width: 20px; height: 20px;
      border-radius: var(--radius-full);
      background: var(--gradient-rose);
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse-rose 2s ease-in-out infinite;
    }

    /* Hamburger */
    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: 32px;
      padding: 4px;
    }

    .ham-line {
      height: 2px;
      background: var(--text-mid);
      border-radius: 1px;
      transition: all var(--transition-base);
      transform-origin: center;
    }

    .ham-line:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
    .ham-line:nth-child(2).open { opacity: 0; }
    .ham-line:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile Menu */
    .mobile-menu {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      padding: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .mobile-menu ul {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .mobile-menu a {
      font-size: 1.0625rem;
      font-weight: 500;
      color: var(--text-dark);
      padding: 0.5rem 0;
    }

    .wa-mobile { width: 100%; justify-content: center; }
  `]
})
export class NavbarComponent {
  private cart = inject(CartService);
  private router = inject(Router);

  isAdminPage = signal(false);
  cartCount = computed(() => this.cart.totalItems());
  scrolled = signal(false);
  menuOpen = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      this.isAdminPage.set(this.router.url.startsWith('/admin'));
    });
    this.isAdminPage.set(this.router.url.startsWith('/admin'));
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleCart() { this.cart.toggleCart(); }
  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
}

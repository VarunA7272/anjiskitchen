import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (!isAdminPage()) {
      <footer class="footer">
      <div class="footer-top">
        <div class="container">
          <div class="footer-grid">
            <!-- Brand -->
            <div class="footer-brand">
              <img src="assets/logo.png" alt="Anji's Kitchen" class="footer-logo" />
              <p class="footer-tagline">Handcrafted with love in Jabalpur, MP. Every product made fresh with care and the finest ingredients.</p>
              <div class="social-links">
                <a href="https://wa.me/917848827245" target="_blank" rel="noopener" aria-label="WhatsApp" class="social-btn wa">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
                </a>
                <a href="mailto:anjiskitchen&#64;gmail.com" aria-label="Email" class="social-btn email">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a routerLink="/">Home</a></li>
                <li><a routerLink="/catalog">Shop All</a></li>
                <li><a routerLink="/about">Our Story</a></li>
                <li><a routerLink="/reviews">Reviews</a></li>
                <li><a routerLink="/contact">Contact</a></li>
              </ul>
            </div>

            <!-- Categories -->
            <div class="footer-col">
              <h4>Categories</h4>
              <ul>
                <li><a routerLink="/catalog" [queryParams]="{category: 'baked-goods'}">Baked Goods</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'pickles'}">Pickles &amp; Preserves</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'snacks'}">Snacks &amp; Namkeen</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'cosmetics'}">Cosmetics</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'homemade-food'}">Homemade Food</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div class="footer-col">
              <h4>Get in Touch</h4>
              <div class="contact-items">
                <a href="https://wa.me/917848827245" target="_blank" class="contact-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
                  +91 78488 27245
                </a>
                <a href="mailto:anjiskitchen&#64;gmail.com" class="contact-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                  </svg>
                  anjiskitchen&#64;gmail.com
                </a>
                <span class="contact-item location">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                  </svg>
                  Jabalpur, Madhya Pradesh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <p>&copy; {{ year }} Anji's Kitchen n MORE. Made with ❤️ in Jabalpur.</p>
          <p class="admin-link"><a routerLink="/admin">Admin</a></p>
        </div>
      </div>
    </footer>
    }
  `,
  styles: [`
    .footer { background: linear-gradient(180deg, #2C1A12 0%, #1a0e09 100%); color: rgba(255,255,255,0.8); margin-top: auto; }
    .footer-top { padding: 4rem 0 2.5rem; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem; }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
    @media (max-width: 580px) { .footer-grid { grid-template-columns: 1fr; } }
    .footer-logo { height: 56px; width: auto; margin-bottom: 1rem; filter: brightness(1.1); }
    .footer-tagline { font-size: .9rem; line-height: 1.7; color: rgba(255,255,255,.6); margin-bottom: 1.25rem; }
    .social-links { display: flex; gap: .5rem; }
    .social-btn { width: 38px; height: 38px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
    .social-btn.wa { background: rgba(37,211,102,.15); color: #25D366; }
    .social-btn.wa:hover { background: rgba(37,211,102,.25); }
    .social-btn.email { background: rgba(232,105,154,.15); color: var(--rose-light); }
    .social-btn.email:hover { background: rgba(232,105,154,.25); }
    .footer-col h4 { font-family: var(--font-heading); font-size: .9375rem; font-weight: 600; color: #fff; margin-bottom: 1rem; }
    .footer-col ul { display: flex; flex-direction: column; gap: .625rem; }
    .footer-col a { font-size: .875rem; color: rgba(255,255,255,.55); transition: color var(--transition-fast); }
    .footer-col a:hover { color: var(--rose-light); }
    .contact-items { display: flex; flex-direction: column; gap: .75rem; }
    .contact-item { display: flex; align-items: center; gap: .5rem; font-size: .875rem; color: rgba(255,255,255,.6); transition: color var(--transition-fast); }
    a.contact-item:hover { color: var(--rose-light); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,.08); padding: 1.25rem 0; }
    .footer-bottom .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .5rem; }
    .footer-bottom p { font-size: .8125rem; color: rgba(255,255,255,.4); }
    .admin-link a { color: rgba(255,255,255,.3); font-size: .8125rem; transition: color var(--transition-fast); }
    .admin-link a:hover { color: rgba(255,255,255,.6); }
  `]
})
export class FooterComponent {
  private router = inject(Router);
  year = new Date().getFullYear();
  isAdminPage = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      this.isAdminPage.set(this.router.url.startsWith('/admin'));
    });
    this.isAdminPage.set(this.router.url.startsWith('/admin'));
  }
}

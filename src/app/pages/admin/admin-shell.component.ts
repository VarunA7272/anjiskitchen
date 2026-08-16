import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-logo">
          <img src="assets/logo.png" alt="Anji's Kitchen" />
          <span class="admin-badge">Admin</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item" id="nav-dashboard">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item" id="nav-products">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
            Products
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item" id="nav-categories">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"/></svg>
            Categories
          </a>
          <a routerLink="/admin/reviews" routerLinkActive="active" class="nav-item" id="nav-reviews">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
            Reviews
          </a>
        </nav>

        <div class="sidebar-footer">
          <a href="/" target="_blank" class="nav-item view-site">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            View Site
          </a>
          <button class="nav-item sign-out" (click)="signOut()" id="admin-sign-out">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <ng-content />
      </main>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
    }

    .admin-sidebar {
      background: rgba(26, 14, 9, 0.95);
      border-right: 1px solid rgba(232, 105, 154, 0.15);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.5rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 1rem;
    }

    .sidebar-logo img {
      height: 64px;
      width: auto;
      object-fit: contain;
      filter: brightness(1.1);
    }

    .admin-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--rose);
      background: rgba(232,105,154,0.12);
      padding: 0.2rem 0.625rem;
      border-radius: var(--radius-full);
      border: 1px solid rgba(232,105,154,0.2);
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0 1rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      color: rgba(255,255,255,0.55);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      cursor: pointer;
      border: none;
      background: none;
      text-align: left;
      width: 100%;
      text-decoration: none;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
    }

    .nav-item.active {
      background: rgba(232,105,154,0.15);
      color: var(--rose-light);
      border: 1px solid rgba(232,105,154,0.2);
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .view-site { color: rgba(255,255,255,0.4); font-size: 0.875rem; }
    .sign-out { color: rgba(229, 62, 62, 0.7); font-size: 0.875rem; }
    .sign-out:hover { color: #fc8181; background: rgba(229, 62, 62, 0.08); }

    .admin-main {
      background: #1a0e09;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .admin-shell { grid-template-columns: 1fr; }
      .admin-sidebar { display: none; }
    }
  `]
})
export class AdminShellComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/admin/login']);
  }
}

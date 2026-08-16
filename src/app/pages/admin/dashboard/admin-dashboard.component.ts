import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, AdminShellComponent],
  template: `
    <app-admin-shell>
      <div class="dashboard">
        <div class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p class="page-sub">Welcome back! Here's your store overview.</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon products-icon">🛍️</div>
            <div class="stat-body">
              <span class="stat-label">Total Products</span>
              <strong class="stat-val">{{ stats().products }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cats-icon">🗂️</div>
            <div class="stat-body">
              <span class="stat-label">Categories</span>
              <strong class="stat-val">{{ stats().categories }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon reviews-icon">⭐</div>
            <div class="stat-body">
              <span class="stat-label">Reviews</span>
              <strong class="stat-val">{{ stats().reviews }}</strong>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active-icon">✅</div>
            <div class="stat-body">
              <span class="stat-label">Active Products</span>
              <strong class="stat-val">{{ stats().activeProducts }}</strong>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <a routerLink="/admin/products" class="action-card" id="dash-add-product">
              <span class="action-icon">➕</span>
              <strong>Add Product</strong>
              <p>Upload a new product with images</p>
            </a>
            <a routerLink="/admin/categories" class="action-card" id="dash-add-category">
              <span class="action-icon">📁</span>
              <strong>Manage Categories</strong>
              <p>Create or edit product categories</p>
            </a>
            <a routerLink="/admin/reviews" class="action-card" id="dash-reviews">
              <span class="action-icon">💬</span>
              <strong>Moderate Reviews</strong>
              <p>Approve or delete customer reviews</p>
            </a>
            <a href="/" target="_blank" class="action-card" id="dash-view-site">
              <span class="action-icon">🌐</span>
              <strong>View Live Site</strong>
              <p>See how your store looks to customers</p>
            </a>
          </div>
        </div>
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .dashboard { padding: 2rem; }

    .page-header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .page-header h1 {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
    }

    .page-sub { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-top: 0.25rem; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

    .stat-card {
      background: rgba(40, 22, 32, 0.7);
      border: 1px solid rgba(232,105,154,0.15);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon { font-size: 2rem; }

    .stat-label {
      display: block;
      font-size: 0.8125rem;
      color: rgba(255,255,255,0.45);
      margin-bottom: 0.25rem;
    }

    .stat-val {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 800;
      color: var(--rose-light);
    }

    .quick-actions h2 {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.25rem;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 900px) { .action-grid { grid-template-columns: repeat(2,1fr); } }

    .action-card {
      background: rgba(40, 22, 32, 0.7);
      border: 1px solid rgba(232,105,154,0.12);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: all var(--transition-base);
    }

    .action-card:hover {
      background: rgba(232,105,154,0.1);
      border-color: rgba(232,105,154,0.3);
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(232,105,154,0.15);
    }

    .action-icon { font-size: 2.5rem; }

    .action-card strong {
      color: #fff;
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 700;
    }

    .action-card p {
      color: rgba(255,255,255,0.4);
      font-size: 0.8125rem;
      line-height: 1.5;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  stats = signal({ products: 0, categories: 0, reviews: 0, activeProducts: 0 });

  async ngOnInit() {
    try {
      const [products, cats, reviews] = await Promise.all([
        this.supabase.getAllProducts(),
        this.supabase.getAllCategories(),
        this.supabase.getAllReviews(),
      ]);
      this.stats.set({
        products: products.length,
        categories: cats.length,
        reviews: reviews.length,
        activeProducts: products.filter(p => p.is_active).length,
      });
    } catch {}
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [AdminShellComponent],
  template: `
    <app-admin-shell>
      <div class="admin-reviews">
        <div class="page-header">
          <div>
            <h1>Reviews</h1>
            <p class="page-sub">{{ reviews().length }} total reviews &middot; {{ pending() }} pending approval</p>
          </div>
        </div>

        <div class="filter-tabs">
          <button class="filter-tab" [class.active]="filter() === 'all'" (click)="filter.set('all')">All</button>
          <button class="filter-tab" [class.active]="filter() === 'pending'" (click)="filter.set('pending')">Pending</button>
          <button class="filter-tab" [class.active]="filter() === 'approved'" (click)="filter.set('approved')">Approved</button>
        </div>

        <div class="reviews-list">
          @if (loading()) {
            <p class="loading-state">Loading reviews...</p>
          } @else if (filteredReviews().length === 0) {
            <p class="empty-state-admin">No reviews in this category.</p>
          } @else {
            @for (review of filteredReviews(); track review.id) {
              <div class="review-row" [class.pending-row]="!review.is_approved">
                <div class="review-meta">
                  <div class="reviewer-av">{{ review.customer_name.charAt(0) }}</div>
                  <div>
                    <strong class="reviewer-nm">{{ review.customer_name }}</strong>
                    @if (review.product_name) { <span class="rev-product">re: {{ review.product_name }}</span> }
                    <div class="stars-small">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</div>
                  </div>
                </div>
                <p class="review-msg">"{{ review.message }}"</p>
                <div class="review-actions">
                  <span class="rev-status" [class.approved]="review.is_approved">{{ review.is_approved ? 'Approved' : 'Pending' }}</span>
                  @if (!review.is_approved) {
                    <button class="table-btn approve" (click)="approveReview(review.id)" [id]="'approve-review-' + review.id">Approve</button>
                  }
                  <button class="table-btn delete" (click)="deleteReview(review.id)" [id]="'del-review-' + review.id">Delete</button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-reviews { padding: 2rem; }
    .page-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; color: #fff; }
    .page-sub { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-top: 0.25rem; }
    .filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .filter-tab { padding: 0.375rem 1rem; border-radius: var(--radius-full); border: 1px solid rgba(255,255,255,0.1); background: none; color: rgba(255,255,255,0.5); font-size: 0.875rem; cursor: pointer; transition: all var(--transition-fast); }
    .filter-tab.active, .filter-tab:hover { background: rgba(232,105,154,0.12); border-color: rgba(232,105,154,0.25); color: var(--rose-light); }
    .reviews-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .review-row { background: rgba(40,22,32,0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center; }
    .pending-row { border-color: rgba(232,105,154,0.2); }
    .review-meta { display: flex; align-items: center; gap: 0.75rem; }
    .reviewer-av { width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-rose); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
    .reviewer-nm { display: block; color: rgba(255,255,255,0.9); font-size: 0.9rem; font-weight: 600; }
    .rev-product { display: block; font-size: 0.75rem; color: var(--gold-light); }
    .stars-small { color: var(--gold-light); font-size: 0.875rem; letter-spacing: 1px; }
    .review-msg { color: rgba(255,255,255,0.55); font-size: 0.875rem; line-height: 1.6; font-style: italic; }
    .review-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .rev-status { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.625rem; border-radius: var(--radius-full); background: rgba(229,62,62,0.1); color: rgba(229,62,62,0.8); }
    .rev-status.approved { background: rgba(72,187,120,0.1); color: #68d391; }
    .table-btn { padding: 0.3rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all var(--transition-fast); border: 1px solid; background: none; }
    .table-btn.approve { border-color: rgba(72,187,120,0.3); color: #68d391; }
    .table-btn.approve:hover { background: rgba(72,187,120,0.1); }
    .table-btn.delete { border-color: rgba(229,62,62,0.3); color: rgba(229,62,62,0.8); }
    .table-btn.delete:hover { background: rgba(229,62,62,0.1); }
    .loading-state, .empty-state-admin { padding: 3rem; text-align: center; color: rgba(255,255,255,0.4); }
  `]
})
export class AdminReviewsComponent implements OnInit {
  private supabase = inject(SupabaseService);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'pending' | 'approved'>('all');

  filteredReviews = () => {
    const f = this.filter();
    if (f === 'pending') return this.reviews().filter(r => !r.is_approved);
    if (f === 'approved') return this.reviews().filter(r => r.is_approved);
    return this.reviews();
  };

  pending = () => this.reviews().filter(r => !r.is_approved).length;

  async ngOnInit() {
    try { this.reviews.set(await this.supabase.getAllReviews()); }
    finally { this.loading.set(false); }
  }

  async approveReview(id: string) { await this.supabase.approveReview(id); this.reviews.update(r => r.map(rev => rev.id === id ? { ...rev, is_approved: true } : rev)); }
  async deleteReview(id: string) { if (!confirm('Delete this review?')) return; await this.supabase.deleteReview(id); this.reviews.update(r => r.filter(rev => rev.id !== id)); }
}

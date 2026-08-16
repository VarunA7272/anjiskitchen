import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Review } from '../../core/models/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="reviews-page" style="padding-top:72px">
      <!-- Hero -->
      <section class="reviews-hero">
        <div class="container">
          <span class="eyebrow">Customer Love</span>
          <h1>What Our <span style="color:var(--rose)">Customers Say</span></h1>
          <p>Real reviews from real customers who've experienced the taste of Anji's Kitchen</p>
          <div class="avg-rating">
            <div class="big-stars">★★★★★</div>
            <strong>5.0</strong>
            <span>out of 5</span>
          </div>
        </div>
      </section>

      <!-- Reviews Grid -->
      <section class="reviews-body section">
        <div class="container">
          @if (loading()) {
            <div class="reviews-masonry">
              @for (_ of [1,2,3,4,5,6]; track $index) {
                <div class="skeleton" style="height:180px;border-radius:var(--radius-lg)"></div>
              }
            </div>
          } @else if (reviews().length === 0) {
            <div class="empty-reviews">
              <p>🌸 No reviews yet. Be the first to share your experience!</p>
            </div>
          } @else {
            <div class="reviews-masonry">
              @for (review of reviews(); track review.id) {
                <div class="review-tile glass-card">
                  <div class="tile-stars">
                    @for (_ of getStars(review.rating); track $index) { <span>★</span> }
                  </div>
                  <p class="tile-text">"{{ review.message }}"</p>
                  @if (review.product_name) {
                    <span class="tile-product">re: {{ review.product_name }}</span>
                  }
                  <div class="tile-author">
                    <div class="tile-avatar">{{ review.customer_name.charAt(0) }}</div>
                    <strong>{{ review.customer_name }}</strong>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- Leave Review Form -->
      <section class="leave-review section-sm" style="background:var(--bg-warm)">
        <div class="container">
          <div class="review-form-card glass-card">
            <div class="section-header">
              <span class="eyebrow">Share Your Experience</span>
              <h2>Leave a Review</h2>
              <div class="rose-divider"></div>
            </div>

            @if (submitted()) {
              <div class="success-msg">
                <span>🎉</span>
                <div>
                  <strong>Thank you for your review!</strong>
                  <p>Your review will be visible after approval.</p>
                </div>
              </div>
            } @else {
              <form class="review-form" (ngSubmit)="submitReview()">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="reviewer-name">Your Name *</label>
                    <input id="reviewer-name" class="form-input" type="text" [(ngModel)]="form.name" name="name" required placeholder="e.g. Priya Sharma" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="product-name">Product Name (optional)</label>
                    <input id="product-name" class="form-input" type="text" [(ngModel)]="form.productName" name="productName" placeholder="e.g. Chocolate Cake" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Rating *</label>
                  <div class="star-picker">
                    @for (i of [1,2,3,4,5]; track i) {
                      <button type="button" class="star-pick" [class.lit]="form.rating >= i" (click)="form.rating = i" [attr.aria-label]="i + ' stars'">★</button>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="review-msg">Your Review *</label>
                  <textarea id="review-msg" class="form-textarea" [(ngModel)]="form.message" name="message" required placeholder="Tell us about your experience..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary" id="submit-review-btn" [disabled]="submitting()">
                  {{ submitting() ? 'Submitting...' : 'Submit Review' }}
                </button>
              </form>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .reviews-hero { padding: 4rem 0 3rem; text-align: center; background: linear-gradient(135deg, #FDF8F4, #FEF0F5); }
    .reviews-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem,4vw,3.5rem); font-weight: 800; margin: 0.75rem 0; }
    .reviews-hero p { color: var(--text-light); font-size: 1rem; margin-bottom: 1.5rem; }
    .avg-rating { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); border-radius: var(--radius-full); padding: 0.5rem 1.25rem; }
    .big-stars { color: var(--gold); font-size: 1.25rem; letter-spacing: 2px; }
    .avg-rating strong { font-size: 1.25rem; font-weight: 800; color: var(--text-dark); }
    .avg-rating span { color: var(--text-light); font-size: 0.875rem; }
    .reviews-masonry { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
    @media (max-width: 900px) { .reviews-masonry { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 560px) { .reviews-masonry { grid-template-columns: 1fr; } }
    .review-tile { padding: 1.75rem; }
    .tile-stars { color: var(--gold); font-size: 1.125rem; margin-bottom: 0.75rem; letter-spacing: 2px; }
    .tile-text { color: var(--text-mid); line-height: 1.7; font-style: italic; font-size: 0.9375rem; margin-bottom: 0.75rem; }
    .tile-product { display: inline-block; font-size: 0.75rem; color: var(--gold-dark); background: rgba(201,168,76,0.1); padding: 0.2rem 0.5rem; border-radius: var(--radius-full); margin-bottom: 1rem; }
    .tile-author { display: flex; align-items: center; gap: 0.625rem; }
    .tile-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gradient-rose); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
    .tile-author strong { font-size: 0.9rem; color: var(--text-dark); }
    .review-form-card { max-width: 680px; margin-inline: auto; padding: 2.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { margin-bottom: 1rem; }
    .star-picker { display: flex; gap: 0.25rem; }
    .star-pick { font-size: 2rem; color: var(--text-muted); cursor: pointer; transition: color var(--transition-fast), transform var(--transition-fast); line-height: 1; background: none; border: none; padding: 0; }
    .star-pick:hover, .star-pick.lit { color: var(--gold); transform: scale(1.1); }
    .success-msg { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-radius: var(--radius-md); background: rgba(72,187,120,0.1); border: 1px solid rgba(72,187,120,0.2); color: var(--text-dark); }
    .success-msg span { font-size: 2rem; }
    .success-msg strong { display: block; font-weight: 700; margin-bottom: 0.25rem; }
    .success-msg p { font-size: 0.875rem; color: var(--text-light); }
    .empty-reviews { text-align: center; padding: 4rem 2rem; color: var(--text-light); font-size: 1rem; }
  `]
})
export class ReviewsComponent implements OnInit {
  private seo = inject(SeoService);
  private supabase = inject(SupabaseService);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  submitted = signal(false);
  submitting = signal(false);

  form = { name: '', productName: '', rating: 5, message: '' };

  getStars(n: number) { return Array(n).fill(0); }

  async ngOnInit() {
    this.seo.setPage({
      title: 'Customer Reviews',
      description: "Read genuine customer reviews for Anji's Kitchen products — homemade food, baked goods, pickles, and more from Jabalpur.",
    });
    try {
      const reviews = await this.supabase.getApprovedReviews();
      this.reviews.set(reviews);
    } catch {
      this.reviews.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async submitReview() {
    if (!this.form.name || !this.form.message || !this.form.rating) return;
    this.submitting.set(true);
    try {
      await this.supabase.submitReview({
        customer_name: this.form.name,
        product_name: this.form.productName || undefined,
        rating: this.form.rating,
        message: this.form.message,
      });
      this.submitted.set(true);
    } catch (e) {
      alert('Failed to submit review. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}

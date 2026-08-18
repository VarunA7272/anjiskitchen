import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="about-page" style="padding-top:72px">
      <!-- Hero -->
      <section class="about-hero">
        <div class="about-hero-bg"></div>
        <div class="container">
          <span class="eyebrow">{{ settings().about.eyebrow }}</span>
          <h1>{{ settings().about.title }}</h1>
          <p class="about-hero-sub">A home business built on love, passion, and the finest handcrafted goods from Jabalpur</p>
        </div>
      </section>

      <!-- Story Section -->
      <section class="story-section section">
        <div class="container">
          <div class="story-grid">
            <div class="story-visual">
              <div class="story-logo-frame">
                <img [src]="settings().about.imageUrl || 'assets/logo.png'" alt="Anji's Kitchen" />
              </div>
              <div class="story-accent">🌸</div>
            </div>
            <div class="story-text">
              <span class="eyebrow">{{ settings().about.eyebrow }}</span>
              <h2>{{ settings().about.title }}</h2>
              <p>{{ settings().about.paragraph1 }}</p>
              <p>{{ settings().about.paragraph2 }}</p>
              <p>{{ settings().about.paragraph3 }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="values-section section-sm" style="background:var(--bg-warm)">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">What Drives Us</span>
            <h2>Our Values</h2>
            <div class="rose-divider"></div>
          </div>
          <div class="values-grid">
            <div class="value-card glass-card">
              <div class="value-icon">❤️</div>
              <h3>Made with Love</h3>
              <p>Every product is handcrafted with genuine care and passion. You taste the difference.</p>
            </div>
            <div class="value-card glass-card">
              <div class="value-icon">🌿</div>
              <h3>All Natural</h3>
              <p>We use fresh, natural ingredients with no artificial preservatives or additives.</p>
            </div>
            <div class="value-card glass-card">
              <div class="value-icon">🏠</div>
              <h3>Home Kitchen</h3>
              <p>Small-batch production ensures consistent quality and personal attention to detail.</p>
            </div>
            <div class="value-card glass-card">
              <div class="value-icon">🤝</div>
              <h3>Community First</h3>
              <p>Supporting local ingredients, local customers, and the community of Jabalpur.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="about-cta section-sm">
        <div class="container">
          <div class="cta-card glass-card">
            <h2>Ready to Taste the Difference?</h2>
            <p>Browse our products and place your order directly via WhatsApp</p>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
              <a routerLink="/catalog" class="btn btn-primary btn-lg">Shop Now</a>
              <a href="https://wa.me/917848827245" target="_blank" class="btn btn-secondary btn-lg">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-hero { padding: 4rem 0 3rem; text-align: center; background: linear-gradient(135deg, #FDF8F4, #FEF0F5); position: relative; overflow: hidden; }
    .about-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(232,105,154,0.1) 0%, transparent 60%); }
    .about-hero .container { position: relative; }
    .about-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem,4vw,3.5rem); font-weight: 800; margin: 0.75rem 0; }
    .about-hero-sub { color: var(--text-light); font-size: 1.0625rem; max-width: 540px; margin-inline: auto; }
    .story-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 4rem; align-items: center; }
    @media (max-width: 768px) { .story-grid { grid-template-columns: 1fr; } .story-visual { display: flex; justify-content: center; } }
    .story-visual { position: relative; display: flex; justify-content: center; }
    .story-logo-frame { width: 280px; height: 280px; border-radius: 50%; overflow: hidden; border: 4px solid rgba(232,105,154,0.2); box-shadow: var(--shadow-xl); background: var(--bg-warm); display: flex; align-items: center; justify-content: center; }
    .story-logo-frame img { width: 100%; height: 100%; object-fit: contain; padding: 1rem; }
    .story-accent { position: absolute; bottom: 0; right: 20%; font-size: 4rem; animation: float 5s ease-in-out infinite; }
    .story-text h2 { font-family: var(--font-heading); font-size: clamp(1.75rem,3vw,2.5rem); font-weight: 700; margin: 0.75rem 0 1.25rem; }
    .story-text p { color: var(--text-mid); line-height: 1.8; margin-bottom: 1rem; font-size: 0.9875rem; }
    .values-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; }
    @media (max-width: 900px) { .values-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 540px) { .values-grid { grid-template-columns: 1fr; } }
    .value-card { padding: 2rem; text-align: center; }
    .value-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .value-card h3 { font-family: var(--font-heading); font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
    .value-card p { color: var(--text-light); font-size: 0.9rem; line-height: 1.6; }
    .cta-card { padding: 3rem; text-align: center; }
    .cta-card h2 { font-family: var(--font-heading); font-size: clamp(1.5rem,3vw,2.25rem); font-weight: 700; margin-bottom: 0.75rem; }
    .cta-card p { color: var(--text-light); margin-bottom: 2rem; }
  `]
})
export class AboutComponent implements OnInit {
  private seo = inject(SeoService);
  private siteSettingsService = inject(SiteSettingsService);

  settings = this.siteSettingsService.settings;

  ngOnInit() {
    this.seo.setPage({
      title: 'About Us',
      description: "Learn about Anji's Kitchen — a home business in Jabalpur making handcrafted food, baked goods, pickles, snacks, and cosmetics with love.",
    });
  }
}

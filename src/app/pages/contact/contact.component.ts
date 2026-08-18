import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  template: `
    <div class="contact-page" style="padding-top:72px">
      <section class="contact-hero">
        <div class="container">
          <span class="eyebrow">Get in Touch</span>
          <h1>Contact <span style="color:var(--rose)">Anji's Kitchen</span></h1>
          <p>We'd love to hear from you! Reach out for orders, custom requests, or just to say hello.</p>
        </div>
      </section>

      <section class="contact-body section">
        <div class="container">
          <div class="contact-grid">
            <!-- Contact Cards -->
            <div class="contact-cards">
              <a [href]="waLink()" target="_blank" class="contact-card glass-card wa-card">
                <div class="contact-icon">💬</div>
                <div class="contact-info">
                  <h3>WhatsApp</h3>
                  <p>Fastest way to reach us!</p>
                  <span class="contact-value">{{ settings().contact.whatsappNumber }}</span>
                </div>
                <svg class="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
              </a>

              <a [href]="phoneLink()" class="contact-card glass-card phone-card">
                <div class="contact-icon">📞</div>
                <div class="contact-info">
                  <h3>Phone</h3>
                  <p>Call us directly</p>
                  <span class="contact-value">{{ settings().contact.phone }}</span>
                </div>
                <svg class="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
              </a>

              <a [href]="'mailto:' + settings().contact.email" class="contact-card glass-card email-card">
                <div class="contact-icon">📧</div>
                <div class="contact-info">
                  <h3>Email</h3>
                  <p>For inquiries &amp; collaborations</p>
                  <span class="contact-value">{{ settings().contact.email }}</span>
                </div>
                <svg class="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
              </a>

              <div class="contact-card glass-card location-card">
                <div class="contact-icon">📍</div>
                <div class="contact-info">
                  <h3>Location</h3>
                  <p>Home delivery available in</p>
                  <span class="contact-value">{{ settings().contact.location }}</span>
                </div>
              </div>

              <!-- Business Hours -->
              <div class="hours-card glass-card">
                <h3>🕐 Business Hours</h3>
                <div class="hours-list">
                  <div class="hour-row"><span>Mon – Sat</span><span class="hour-val">{{ settings().contact.hoursMonSat }}</span></div>
                  <div class="hour-row"><span>Sunday</span><span class="hour-val">{{ settings().contact.hoursSun }}</span></div>
                  <div class="hour-row"><span>WhatsApp</span><span class="hour-val open-badge">{{ settings().contact.hoursWa }}</span></div>
                </div>
              </div>
            </div>

            <!-- WhatsApp CTA -->
            <div class="wa-cta-panel glass-card">
              <div class="wa-icon-big">💚</div>
              <h2>{{ settings().waBanner.title }}</h2>
              <p>{{ settings().waBanner.subtext }}</p>
              <div class="wa-cta-steps">
                <div class="wa-step"><span class="step-num">1</span><span>Browse our catalog</span></div>
                <div class="wa-step"><span class="step-num">2</span><span>Add items to cart</span></div>
                <div class="wa-step"><span class="step-num">3</span><span>Click "Order via WhatsApp"</span></div>
                <div class="wa-step"><span class="step-num">4</span><span>Confirm &amp; we deliver! 🎉</span></div>
              </div>
              <a [href]="waLink()" target="_blank" class="btn wa-big-btn">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/></svg>
                {{ settings().waBanner.buttonText }}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact-hero { padding: 4rem 0 3rem; text-align: center; background: linear-gradient(135deg, #FDF8F4, #FEF0F5); }
    .contact-hero h1 { font-family: var(--font-heading); font-size: clamp(2rem,4vw,3.5rem); font-weight: 800; margin: 0.75rem 0; }
    .contact-hero p { color: var(--text-light); font-size: 1rem; max-width: 480px; margin-inline: auto; }
    .contact-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
    .contact-cards { display: flex; flex-direction: column; gap: 1rem; }
    .contact-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; text-decoration: none; transition: all var(--transition-base); }
    .contact-card:hover { transform: translateX(4px); box-shadow: var(--shadow-md); }
    .contact-icon { font-size: 2rem; flex-shrink: 0; }
    .contact-info { flex: 1; }
    .contact-info h3 { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.125rem; }
    .contact-info p { font-size: 0.8125rem; color: var(--text-light); }
    .contact-value { font-size: 0.9375rem; font-weight: 600; color: var(--rose); }
    .arrow-icon { color: var(--text-muted); flex-shrink: 0; }
    .wa-card:hover .contact-value { color: #25D366; }
    .hours-card { padding: 1.5rem; }
    .hours-card h3 { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
    .hours-list { display: flex; flex-direction: column; gap: 0.625rem; }
    .hour-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-mid); }
    .hour-val { font-weight: 600; color: var(--text-dark); }
    .open-badge { color: #25D366 !important; }
    .wa-cta-panel { padding: 2.5rem; text-align: center; position: sticky; top: 5rem; }
    .wa-icon-big { font-size: 3.5rem; margin-bottom: 1rem; }
    .wa-cta-panel h2 { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
    .wa-cta-panel p { color: var(--text-light); font-size: 0.9375rem; line-height: 1.7; margin-bottom: 1.5rem; }
    .wa-cta-steps { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; text-align: left; }
    .wa-step { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9375rem; color: var(--text-mid); }
    .step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--gradient-rose); color: #fff; font-size: 0.8125rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .wa-big-btn { display: flex; align-items: center; justify-content: center; gap: 0.625rem; width: 100%; padding: 1rem; border-radius: var(--radius-full); background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; font-size: 1.0625rem; font-weight: 700; box-shadow: 0 6px 24px rgba(37,211,102,0.3); transition: all var(--transition-base); }
    .wa-big-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,211,102,0.4); }
  `]
})
export class ContactComponent implements OnInit {
  private seo = inject(SeoService);
  private siteSettingsService = inject(SiteSettingsService);

  settings = this.siteSettingsService.settings;
  waLink = this.siteSettingsService.waLink;
  phoneLink = this.siteSettingsService.phoneLink;

  ngOnInit() {
    this.seo.setPage({
      title: 'Contact Us',
      description: "Contact Anji's Kitchen in Jabalpur. Order via WhatsApp, call, or email us for homemade food, baked goods, and more.",
    });
  }
}

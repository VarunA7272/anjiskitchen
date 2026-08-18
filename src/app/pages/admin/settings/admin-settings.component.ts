import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { SiteSettings } from '../../../core/models/site-settings.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule, AdminShellComponent],
  template: `
    <app-admin-shell>
      <div class="admin-settings">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1>Site Content CMS</h1>
            <p class="page-sub">Edit hero banner, headings, about story, contact details, and images across the website</p>
          </div>
          <button class="btn btn-primary" (click)="saveAll()" id="save-settings-btn" [disabled]="saving()">
            {{ saving() ? 'Saving Changes...' : '⚡ Save All Changes' }}
          </button>
        </div>

        @if (savedNotice()) {
          <div class="saved-banner">
            <span>✅</span>
            <span>Site content updated successfully! Live website will now display your changes.</span>
          </div>
        }

        <!-- Tabs -->
        <div class="settings-tabs">
          <button class="tab-btn" [class.active]="activeTab() === 'hero'" (click)="activeTab.set('hero')">🎨 Hero & Banner</button>
          <button class="tab-btn" [class.active]="activeTab() === 'about'" (click)="activeTab.set('about')">📖 About Story</button>
          <button class="tab-btn" [class.active]="activeTab() === 'wa'" (click)="activeTab.set('wa')">💬 WhatsApp Banner</button>
          <button class="tab-btn" [class.active]="activeTab() === 'contact'" (click)="activeTab.set('contact')">📍 Contact & Hours</button>
        </div>

        <!-- 1. HERO SECTION CMS -->
        @if (activeTab() === 'hero') {
          <div class="settings-card glass-panel">
            <h2>🎨 Hero Section Settings</h2>
            <p class="card-desc">Edit the main headline, tagline, buttons, and stats displayed at the top of the homepage.</p>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Hero Eyebrow (Tagline)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.eyebrow" name="hero_eyebrow" />
              </div>

              <div class="form-group">
                <label class="form-label">Brand Name / Heading Title</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.title" name="hero_title" />
              </div>

              <div class="form-group">
                <label class="form-label">Subtitle / Tagline</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.subtitle" name="hero_subtitle" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Hero Description Text</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.hero.description" name="hero_description"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Primary CTA Button Label</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.primaryBtnText" name="hero_btn1" />
              </div>

              <div class="form-group">
                <label class="form-label">WhatsApp Button Label</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.secondaryBtnText" name="hero_btn2" />
              </div>

              <!-- Hero Stats -->
              <div class="form-group">
                <label class="form-label">Stat 1 (Products)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.statProducts" name="hero_stat1" placeholder="e.g. 100+" />
              </div>

              <div class="form-group">
                <label class="form-label">Stat 2 (Happy Customers)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.statCustomers" name="hero_stat2" placeholder="e.g. 500+" />
              </div>

              <div class="form-group">
                <label class="form-label">Stat 3 (Average Rating)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.statRating" name="hero_stat3" placeholder="e.g. 5★" />
              </div>

              <!-- Hero Image Upload -->
              <div class="form-group full-width">
                <label class="form-label">Hero Logo / Image</label>
                <div class="image-upload-row">
                  @if (form.hero.imageUrl) {
                    <div class="preview-box">
                      <img [src]="form.hero.imageUrl" alt="Hero Logo" />
                    </div>
                  }
                  <div class="upload-controls">
                    <input type="file" id="hero-img-input" accept="image/*" (change)="onHeroImageUpload($event)" style="display:none" />
                    <label for="hero-img-input" class="btn btn-secondary btn-sm">Upload New Hero Image</label>
                    <input class="form-input dark-input" type="text" [(ngModel)]="form.hero.imageUrl" name="hero_image_url" placeholder="Or enter Image URL" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 2. ABOUT STORY CMS -->
        @if (activeTab() === 'about') {
          <div class="settings-card glass-panel">
            <h2>📖 About Story Settings</h2>
            <p class="card-desc">Edit the story card on the homepage and the full About Us page.</p>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Section Eyebrow</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.about.eyebrow" name="about_eyebrow" />
              </div>

              <div class="form-group">
                <label class="form-label">Section Heading</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.about.title" name="about_title" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Story Paragraph 1</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.about.paragraph1" name="about_p1"></textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Story Paragraph 2</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.about.paragraph2" name="about_p2"></textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Story Paragraph 3</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.about.paragraph3" name="about_p3"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Badge Heading</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.about.badgeText" name="about_badge1" />
              </div>

              <div class="form-group">
                <label class="form-label">Badge Subtext</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.about.badgeSub" name="about_badge2" />
              </div>

              <!-- About Image -->
              <div class="form-group full-width">
                <label class="form-label">About Story Image</label>
                <div class="image-upload-row">
                  @if (form.about.imageUrl) {
                    <div class="preview-box">
                      <img [src]="form.about.imageUrl" alt="About Image" />
                    </div>
                  }
                  <div class="upload-controls">
                    <input type="file" id="about-img-input" accept="image/*" (change)="onAboutImageUpload($event)" style="display:none" />
                    <label for="about-img-input" class="btn btn-secondary btn-sm">Upload New Image</label>
                    <input class="form-input dark-input" type="text" [(ngModel)]="form.about.imageUrl" name="about_image_url" placeholder="Or enter Image URL" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 3. WHATSAPP BANNER CMS -->
        @if (activeTab() === 'wa') {
          <div class="settings-card glass-panel">
            <h2>💬 WhatsApp Banner Settings</h2>
            <p class="card-desc">Edit the green call-to-action banner on the homepage and contact page.</p>

            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label">Banner Title</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.waBanner.title" name="wa_title" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Banner Subtext / Details</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.waBanner.subtext" name="wa_subtext" />
              </div>

              <div class="form-group">
                <label class="form-label">Button Label</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.waBanner.buttonText" name="wa_btn" />
              </div>
            </div>
          </div>
        }

        <!-- 4. CONTACT INFO CMS -->
        @if (activeTab() === 'contact') {
          <div class="settings-card glass-panel">
            <h2>📍 Contact Info & Business Hours</h2>
            <p class="card-desc">Edit phone number, email address, location, and business hours across the site.</p>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">WhatsApp Number (with +91)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.contact.whatsappNumber" name="contact_wa" />
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.contact.phone" name="contact_phone" />
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input class="form-input dark-input" type="email" [(ngModel)]="form.contact.email" name="contact_email" />
              </div>

              <div class="form-group">
                <label class="form-label">Location / City</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.contact.location" name="contact_loc" />
              </div>

              <div class="form-group">
                <label class="form-label">Hours: Mon – Sat</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.contact.hoursMonSat" name="hours_ms" />
              </div>

              <div class="form-group">
                <label class="form-label">Hours: Sunday</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.contact.hoursSun" name="hours_sun" />
              </div>

              <div class="form-group">
                <label class="form-label">WhatsApp Availability Status</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.contact.hoursWa" name="hours_wa" />
              </div>
            </div>
          </div>
        }

        <!-- Save Button Footer -->
        <div class="settings-footer">
          <button class="btn btn-primary btn-lg" (click)="saveAll()" id="save-settings-bottom-btn" [disabled]="saving()">
            {{ saving() ? 'Saving Changes...' : '⚡ Save All Site Changes' }}
          </button>
        </div>
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-settings { padding: 2rem; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; color: #fff; }
    .page-sub { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-top: 0.25rem; }

    .saved-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      background: rgba(72,187,120,0.15);
      border: 1px solid rgba(72,187,120,0.3);
      color: #68d391;
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
      animation: fade-in 0.3s ease;
    }

    .settings-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 0.625rem 1.25rem;
      border-radius: var(--radius-full);
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(40,22,32,0.6);
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .tab-btn.active, .tab-btn:hover {
      background: rgba(232,105,154,0.15);
      border-color: rgba(232,105,154,0.3);
      color: var(--rose-light);
    }

    .settings-card {
      background: rgba(40,22,32,0.7);
      border: 1px solid rgba(232,105,154,0.15);
      border-radius: var(--radius-xl);
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .settings-card h2 {
      font-family: var(--font-heading);
      font-size: 1.375rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.375rem;
    }

    .card-desc {
      color: rgba(255,255,255,0.45);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

    .full-width { grid-column: 1 / -1; }

    .dark-input {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.9);
    }

    .dark-input:focus {
      border-color: var(--rose);
      background: rgba(255,255,255,0.08);
      box-shadow: 0 0 0 3px rgba(232,105,154,0.12);
    }

    .image-upload-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: rgba(255,255,255,0.03);
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px dashed rgba(232,105,154,0.25);
    }

    .preview-box {
      width: 72px; height: 72px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: rgba(0,0,0,0.3);
      flex-shrink: 0;
    }

    .preview-box img { width: 100%; height: 100%; object-fit: contain; }

    .upload-controls {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .settings-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private siteSettingsService = inject(SiteSettingsService);
  private supabase = inject(SupabaseService);

  activeTab = signal<'hero' | 'about' | 'wa' | 'contact'>('hero');
  saving = signal(false);
  savedNotice = signal(false);

  form: SiteSettings = JSON.parse(JSON.stringify(this.siteSettingsService.settings()));

  ngOnInit() {
    this.form = JSON.parse(JSON.stringify(this.siteSettingsService.settings()));
  }

  async onHeroImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const url = await this.supabase.uploadImage(input.files[0]);
    this.form.hero.imageUrl = url;
  }

  async onAboutImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const url = await this.supabase.uploadImage(input.files[0]);
    this.form.about.imageUrl = url;
  }

  async saveAll() {
    this.saving.set(true);
    this.savedNotice.set(false);

    try {
      await this.siteSettingsService.updateSettings(this.form);
      this.savedNotice.set(true);
      setTimeout(() => this.savedNotice.set(false), 3500);
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      this.saving.set(false);
    }
  }
}

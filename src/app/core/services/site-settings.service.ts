import { Injectable, signal, inject } from '@angular/core';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../models/site-settings.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private supabase = inject(SupabaseService);

  settings = signal<SiteSettings>(this.loadLocalSettings());
  loading = signal(false);

  waLink = () => 'https://wa.me/' + (this.settings().contact.whatsappNumber || '').replace(/[^0-9]/g, '');
  phoneLink = () => 'tel:' + (this.settings().contact.phone || '').replace(/[^0-9]/g, '');

  constructor() {
    this.fetchSettings();
  }

  private loadLocalSettings(): SiteSettings {
    try {
      const stored = localStorage.getItem('anjis_site_settings');
      return stored ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  }

  private saveLocalSettings(s: SiteSettings) {
    try {
      localStorage.setItem('anjis_site_settings', JSON.stringify(s));
    } catch {}
  }

  async fetchSettings(): Promise<SiteSettings> {
    this.loading.set(true);
    try {
      const dbSettings = await this.supabase.getSiteSettings();
      if (dbSettings) {
        const merged = { ...DEFAULT_SITE_SETTINGS, ...dbSettings };
        this.settings.set(merged);
        this.saveLocalSettings(merged);
        return merged;
      }
    } catch {
      // Fallback to local signal
    } finally {
      this.loading.set(false);
    }
    return this.settings();
  }

  async updateSettings(updated: Partial<SiteSettings>): Promise<void> {
    const current = this.settings();
    const newSettings: SiteSettings = {
      hero: { ...current.hero, ...updated.hero },
      about: { ...current.about, ...updated.about },
      waBanner: { ...current.waBanner, ...updated.waBanner },
      contact: { ...current.contact, ...updated.contact },
    };

    this.settings.set(newSettings);
    this.saveLocalSettings(newSettings);

    try {
      await this.supabase.updateSiteSettings(newSettings);
    } catch (e) {
      console.warn('Could not save to Supabase DB, saved to local state:', e);
    }
  }
}

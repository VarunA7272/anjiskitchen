import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private baseTitle = "Anji's Kitchen n MORE";
  private baseDescription = "Anji's Kitchen — Handcrafted homemade food, baked goods, pickles, snacks, and cosmetics from Jabalpur, MP. Order via WhatsApp.";

  constructor(private title: Title, private meta: Meta) {}

  setPage(data: Partial<SeoData>): void {
    const fullTitle = data.title ? `${data.title} | ${this.baseTitle}` : this.baseTitle;
    const description = data.description ?? this.baseDescription;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    if (data.keywords) this.meta.updateTag({ name: 'keywords', content: data.keywords });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (data.ogImage) this.meta.updateTag({ property: 'og:image', content: data.ogImage });
  }
}

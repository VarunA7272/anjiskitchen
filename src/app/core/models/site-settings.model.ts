export interface HeroSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  primaryBtnText: string;
  secondaryBtnText: string;
  statProducts: string;
  statCustomers: string;
  statRating: string;
  imageUrl?: string;
}

export interface AboutSettings {
  eyebrow: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  imageUrl?: string;
  badgeText: string;
  badgeSub: string;
}

export interface WaBannerSettings {
  title: string;
  subtext: string;
  buttonText: string;
}

export interface ContactSettings {
  whatsappNumber: string;
  phone: string;
  email: string;
  location: string;
  hoursMonSat: string;
  hoursSun: string;
  hoursWa: string;
}

export interface SiteSettings {
  hero: HeroSettings;
  about: AboutSettings;
  waBanner: WaBannerSettings;
  contact: ContactSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero: {
    eyebrow: '✨ Handcrafted in Jabalpur, MP',
    title: 'Anji\'s Kitchen n MORE',
    subtitle: 'Handcrafted with love',
    description: 'Homemade with love — from kitchen to your doorstep. Fresh baked goods, pickles, snacks, cosmetics & more.',
    primaryBtnText: 'Shop Now',
    secondaryBtnText: 'Chat with Us',
    statProducts: '100+',
    statCustomers: '500+',
    statRating: '5★',
    imageUrl: 'assets/logo.png',
  },
  about: {
    eyebrow: 'Our Story',
    title: 'Made with Love, Straight from Our Kitchen',
    paragraph1: 'Anji\'s Kitchen began as a passion for homemade food — the kind that brings warmth, comfort, and nostalgia. Based in Jabalpur, Madhya Pradesh, we craft every product by hand using traditional recipes and the finest local ingredients.',
    paragraph2: 'From our signature baked goods and homemade pickles to natural cosmetics and hair accessories — everything we make carries the love of a home kitchen.',
    paragraph3: 'Based in Jabalpur, Madhya Pradesh, we believe in the power of homemade goodness. No preservatives, no compromises — just pure, authentic products.',
    imageUrl: 'assets/logo.png',
    badgeText: 'Homemade',
    badgeSub: 'with love',
  },
  waBanner: {
    title: 'Ready to Order? Chat Directly on WhatsApp!',
    subtext: 'Fast responses • Custom orders welcome • Free delivery within Jabalpur',
    buttonText: 'Start WhatsApp Chat',
  },
  contact: {
    whatsappNumber: '+91 78488 27245',
    phone: '+91 78488 27245',
    email: 'anjiskitchen@gmail.com',
    location: 'Jabalpur, Madhya Pradesh',
    hoursMonSat: '9:00 AM – 8:00 PM',
    hoursSun: '10:00 AM – 6:00 PM',
    hoursWa: 'Always Open',
  },
};

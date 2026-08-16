import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'anjis_kitchen_cart';

  items = signal<CartItem[]>(this.loadFromStorage());
  isOpen = signal<boolean>(false);

  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  totalPrice = computed(() => this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  constructor() {}

  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
  }

  addItem(product: Product, quantity = 1, selectedSize?: string): void {
    this.items.update(items => {
      const existing = items.find(
        i => i.product.id === product.id && i.selectedSize === selectedSize
      );
      if (existing) {
        return items.map(i =>
          i.product.id === product.id && i.selectedSize === selectedSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...items, { product, quantity, selectedSize }];
    });
    this.saveToStorage();
    this.openCart();
  }

  removeItem(productId: string, selectedSize?: string): void {
    this.items.update(items =>
      items.filter(i => !(i.product.id === productId && i.selectedSize === selectedSize))
    );
    this.saveToStorage();
  }

  updateQuantity(productId: string, quantity: number, selectedSize?: string): void {
    if (quantity <= 0) {
      this.removeItem(productId, selectedSize);
      return;
    }
    this.items.update(items =>
      items.map(i =>
        i.product.id === productId && i.selectedSize === selectedSize
          ? { ...i, quantity }
          : i
      )
    );
    this.saveToStorage();
  }

  clearCart(): void {
    this.items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  openCart(): void { this.isOpen.set(true); }
  closeCart(): void { this.isOpen.set(false); }
  toggleCart(): void { this.isOpen.update(v => !v); }

  sendWhatsAppOrder(): void {
    const items = this.items();
    if (!items.length) return;

    const lines = items.map(i => {
      const size = i.selectedSize ? ` (${i.selectedSize})` : '';
      return `• ${i.product.name}${size} × ${i.quantity} = ₹${(i.product.price * i.quantity).toFixed(0)}`;
    });

    const message = [
      '🛒 *New Order from Anji\'s Kitchen Website*',
      '',
      ...lines,
      '',
      `*Total: ₹${this.totalPrice().toFixed(0)}*`,
      '',
      'Please confirm my order. Thank you! 🙏',
    ].join('\n');

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${environment.whatsapp.number}?text=${encoded}`;
    window.open(url, '_blank');
  }
}

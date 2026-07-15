import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {

  private STORAGE_KEY = 'phonezone_cart';

  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.syncToStorage();
  }

  // =========================
  // ADD ITEM
  // =========================
  addItem(product: Product, quantity = 1): void {

    const items = [...this.cartSubject.value];
    const existing = items.find(i => i.product.id === product.id);
    const stockLimit = Math.max(0, product.stockQuantity);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, stockLimit);
    } else {
      items.push({
        product,
        quantity: Math.min(quantity, stockLimit)
      });
    }

    this.cartSubject.next(items);
    this.syncToStorage();
  }

  // =========================
  // REMOVE ITEM
  // =========================
  removeItem(productId: string): void {
    const updated = this.cartSubject.value.filter(
      i => i.product.id !== productId
    );

    this.cartSubject.next(updated);
    this.syncToStorage();
  }

  // =========================
  // UPDATE QTY
  // =========================
  updateQuantity(productId: string, qty: number): void {

    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }

    const updated = this.cartSubject.value.map(i =>
      i.product.id === productId
        ? {
            ...i,
            quantity: Math.min(qty, Math.max(0, i.product.stockQuantity))
          }
        : i
    );

    this.cartSubject.next(updated);
    this.syncToStorage();
  }

  // =========================
  // TOTAL
  // =========================
  getTotal(): number {
    return this.cartSubject.value.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
  }

  // =========================
  // COUNT
  // =========================
  getCount(): number {
    return this.cartSubject.value.reduce(
      (sum, i) => sum + i.quantity,
      0
    );
  }

  // =========================
  // CLEAR
  // =========================
  clearCart(): void {
    this.cartSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // =========================
  // GET ITEMS
  // =========================
  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  // =========================
  // STORAGE SAVE
  // =========================
  private syncToStorage(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.cartSubject.value)
    );
  }

  // =========================
  // STORAGE LOAD
  // =========================
  private loadCart(): CartItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
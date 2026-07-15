import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { CartItem, LoyaltyData, Order } from '../../../core/models';
import { Subscription } from 'rxjs';
import { assetUrl } from '../../../core/utils/asset-url';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  items: CartItem[] = [];
  private sub!: Subscription;

  loading = false;
  confirmed = false;
  orderNumber = '';
  error = '';
  loyaltyData: LoyaltyData | null = null;
  confirmedOrder: Order | null = null;

  readonly DELIVERY_FEE = 3;
  readonly FREE_DELIVERY_THRESHOLD = 50;

  delivery = {
    deliveryOption: 'HOME_DELIVERY' as 'HOME_DELIVERY' | 'PICKUP',
    deliveryAddress: '',
    deliveryCity: 'Sousse',
    deliveryPhone: ''
  };

  constructor(
    public cart: CartService,
    private orderService: OrderService,
    private loyaltyService: LoyaltyService,
  ) {}

  ngOnInit(): void {
    this.sub = this.cart.cart$.subscribe(items => {
      this.items = items || [];
    });

    this.loyaltyService.getLoyaltyData().subscribe({
      next: data => this.loyaltyData = data,
      error: () => this.loyaltyData = null,
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  imageUrl(url?: string): string {
    return assetUrl(url);
  }

  productImage(item: CartItem): string {
    const firstImage = item.product.imageUrls && item.product.imageUrls.length > 0
      ? item.product.imageUrls[0]
      : '';

    return this.imageUrl(firstImage);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  get total(): number {
    return this.cart.getTotal();
  }

  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get freeScreenProtectorCount(): number {
    return this.computeFreeScreenProtectors();
  }

  get loyaltyDiscount(): number {
    return this.computeScreenProtectorDiscount();
  }

  get totalAfterLoyalty(): number {
    return Math.max(0, this.total - this.loyaltyDiscount);
  }

  get deliveryFee(): number {
    if (this.delivery.deliveryOption === 'PICKUP') return 0;

    return this.totalAfterLoyalty > this.FREE_DELIVERY_THRESHOLD
      ? 0
      : this.DELIVERY_FEE;
  }

  get finalTotal(): number {
    return this.totalAfterLoyalty + this.deliveryFee;
  }

  remove(id: string): void {
    this.cart.removeItem(id);
  }

  updateQty(id: string, qty: number): void {
    this.cart.updateQuantity(id, qty);
  }

  checkout(): void {
    if (!this.items || this.items.length === 0) return;

    if (
      this.delivery.deliveryOption === 'HOME_DELIVERY' &&
      (!this.delivery.deliveryAddress.trim() || !this.delivery.deliveryPhone.trim())
    ) {
      this.error = 'Veuillez remplir téléphone et adresse';
      return;
    }

    this.loading = true;
    this.error = '';
    this.confirmedOrder = null;

    const cartItems = this.items.map(i => ({
      productId: i.product.id,
      quantity: i.quantity
    }));

    this.orderService.createOrder(cartItems, this.delivery).subscribe({
      next: (res) => {
        this.loading = false;
        this.confirmed = true;
        this.confirmedOrder = res.order;
        this.orderNumber = res.order.orderNumber;

        this.cart.clearCart();

        this.delivery = {
          deliveryOption: 'HOME_DELIVERY',
          deliveryAddress: '',
          deliveryCity: 'Sousse',
          deliveryPhone: ''
        };
      },

      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Erreur lors de la commande';
      }
    });
  }

  private computeFreeScreenProtectors(): number {
    const requested = this.items
      .filter(item => item.product.category === 'SCREEN_PROTECTOR')
      .reduce((sum, item) => sum + item.quantity, 0);

    if (!this.loyaltyData || requested <= 0) return 0;

    let remaining = requested;

    let free = Math.min(
      remaining,
      this.loyaltyData.activeVouchers.filter(v => v.type === 'SCREEN_PROTECTOR_FREE').length,
    );

    remaining -= free;

    let progress = this.loyaltyData.counter.screenProtectorCount % 5;

    while (remaining > 0) {
      const paidNow = Math.min(5 - progress, remaining);
      remaining -= paidNow;
      progress += paidNow;

      if (progress === 5) {
        progress = 0;

        if (remaining > 0) {
          free += 1;
          remaining -= 1;
        }
      }
    }

    return free;
  }

  private computeScreenProtectorDiscount(): number {
    let remainingFree = this.freeScreenProtectorCount;
    let discount = 0;

    for (const item of this.items) {
      if (item.product.category !== 'SCREEN_PROTECTOR' || remainingFree <= 0) continue;

      const freeForItem = Math.min(remainingFree, item.quantity);
      discount += freeForItem * item.product.price;
      remainingFree -= freeForItem;
    }

    return discount;
  }
}
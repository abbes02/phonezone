import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models';
import { assetUrl } from '../../../core/utils/asset-url';

@Component({ selector: 'app-product-detail', templateUrl: './product-detail.component.html', styleUrls: ['./product-detail.component.scss'] })
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  quantity = 1;
  added = false;
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/catalog']);
      return;
    }

    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: p => {
        this.product = p;
        this.selectedImage = p.imageUrls?.[0] ?? '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/catalog']);
      }
    });
  }

  addToCart(): void {
    if (!this.product || !this.product.isActive) return;
    this.quantity = Math.min(this.quantity, this.product.stockQuantity);
    this.cart.addItem(this.product, this.quantity);
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }

  decreaseQuantity(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  increaseQuantity(): void {
    if (!this.product) return;
    this.quantity = Math.min(this.quantity + 1, this.product.stockQuantity);
  }

  imageUrl(url?: string): string { return assetUrl(url); }

  categoryLabel(cat: string): string {
    return { PHONE: 'Telephone', ACCESSORY: 'Accessoire', SCREEN_PROTECTOR: 'Anti-casse' }[cat] ?? cat;
  }
}

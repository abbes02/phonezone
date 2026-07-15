import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

import { Product } from '../../../core/models';
import { assetUrl } from '../../../core/utils/asset-url';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  products: Product[] = [];
  loading = false;
  search = '';
  category = '';
  page = 1;
  totalPages = 1;
  addedId = '';

  private searchSubject = new Subject<string>();

  categories = [
    { value: '', label: 'Tous' },
    { value: 'PHONE', label: 'Téléphones' },
    { value: 'ACCESSORY', label: 'Accessoires' },
    { value: 'SCREEN_PROTECTOR', label: 'Anti-casse' },
  ];

  constructor(
    private productService: ProductService,
    private cart: CartService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load(): void {
    this.loading = true;

    this.productService.getProducts(
      this.category || undefined,
      this.search || undefined,
      this.page
    ).subscribe({
      next: (res) => {
        this.products = res.data;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  onSearch(val: string): void {
    this.search = val;
    this.searchSubject.next(val);
  }

  setCategory(cat: string): void {
    this.category = cat;
    this.page = 1;
    this.load();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.load();
  }

  imageUrl(url?: string): string {
    return assetUrl(url);
  }

  openProduct(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  addToCart(product: Product, event?: Event): void {
    event?.stopPropagation();

    if (!product.isActive) return;

    // 🔥 CHECK LOGIN
    if (!this.auth.isAuthenticated()) {
      localStorage.setItem('pendingCartItem', JSON.stringify(product));
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/catalog' }
      });
      return;
    }

    this.cart.addItem(product, 1);
    this.addedId = product.id;

    setTimeout(() => this.addedId = '', 1500);
  }
}
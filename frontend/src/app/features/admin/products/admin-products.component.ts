import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { assetUrl } from '../../../core/utils/asset-url';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  showForm = false;
  editingId = '';
  error = '';
  page = 1;
  totalPages = 1;

  selectedImages: File[] = [];
  selectedImagePreviews: string[] = [];

  categories = [
    { value: 'PHONE', label: 'Téléphone' },
    { value: 'ACCESSORY', label: 'Accessoire' },
    { value: 'SCREEN_PROTECTOR', label: 'Anti-casse' },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    category: ['PHONE', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.productService.getProducts(undefined, undefined, this.page, 10).subscribe({
      next: (res) => {
        this.products = res.data;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  imageUrl(url?: string): string {
    return assetUrl(url);
  }

  openNew(): void {
    this.editingId = '';
    this.clearSelectedImages();
    this.form.reset({
      category: 'PHONE',
      stockQuantity: 0,
    });
    this.showForm = true;
    this.error = '';
  }

  openEdit(product: Product): void {
    this.editingId = product.id;
    this.clearSelectedImages();

    this.form.patchValue({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
    });

    this.showForm = true;
    this.error = '';
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.clearSelectedImages();

    this.selectedImages = Array.from(input.files ?? []);

    this.selectedImagePreviews = this.selectedImages.map((file) =>
      URL.createObjectURL(file),
    );
  }

  removeSelectedImage(index: number): void {
    URL.revokeObjectURL(this.selectedImagePreviews[index]);

    this.selectedImages.splice(index, 1);
    this.selectedImagePreviews.splice(index, 1);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = new FormData();

    Object.entries(this.form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });

    this.selectedImages.forEach((file) => {
      payload.append('images', file);
    });

    const request$ = this.editingId
      ? this.productService.updateProduct(this.editingId, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.showForm = false;
        this.clearSelectedImages();
        this.load();
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Erreur lors de l’enregistrement';
      },
    });
  }

  delete(id: string): void {
    if (!confirm('Supprimer ce produit ?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err.error?.message ?? 'Erreur'),
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.clearSelectedImages();
  }

  private clearSelectedImages(): void {
    this.selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    this.selectedImages = [];
    this.selectedImagePreviews = [];
  }
}
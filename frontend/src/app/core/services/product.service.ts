import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, PaginatedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(
    category?: string,
    search?: string,
    page = 1,
    limit = 12,
  ): Observable<PaginatedResult<Product>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResult<Product>>(this.url, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  createProduct(dto: Partial<Product> | FormData): Observable<Product> {
    return this.http.post<Product>(this.url, dto);
  }

  updateProduct(id: string, dto: Partial<Product> | FormData): Observable<Product> {
    return this.http.patch<Product>(`${this.url}/${id}`, dto);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
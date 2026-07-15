import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, PaginatedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private url = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(
    items: { productId: string; quantity: number }[],
    delivery: {
      deliveryOption: 'PICKUP' | 'HOME_DELIVERY';
      deliveryAddress?: string;
      deliveryCity?: string;
      deliveryPhone?: string;
    },
  ): Observable<{ order: Order; paymentInfo: string }> {
    return this.http.post<{ order: Order; paymentInfo: string }>(this.url, { items, ...delivery });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.url}/mine`);
  }

  getAllOrders(page = 1, limit = 10): Observable<PaginatedResult<Order>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResult<Order>>(this.url, { params });
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.url}/${id}/status`, { status });
  }
}

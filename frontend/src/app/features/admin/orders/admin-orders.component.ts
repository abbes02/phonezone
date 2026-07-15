import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss', '../products/admin-products.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  page = 1;
  totalPages = 1;

  statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.orderService.getAllOrders(this.page).subscribe({
      next: r => {
        this.orders = r.data;
        this.totalPages = r.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateStatus(id: string, status: string): void {
    this.orderService.updateOrderStatus(id, status).subscribe(() => this.load());
  }

  getDeliveryLabel(order: Order): string {
    return order.deliveryOption === 'HOME_DELIVERY'
      ? 'Livraison à domicile'
      : 'Retrait en boutique';
  }
}
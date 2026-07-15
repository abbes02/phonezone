import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

@Component({ selector: 'app-orders', templateUrl: './orders.component.html', styleUrls: ['../repairs/repairs.component.scss'] })
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  selected: Order | null = null;

  constructor(private orderService: OrderService) {}
  ngOnInit(): void { this.loading = true; this.orderService.getMyOrders().subscribe({ next: o => { this.orders = o; this.loading = false; }, error: () => this.loading = false }); }
}

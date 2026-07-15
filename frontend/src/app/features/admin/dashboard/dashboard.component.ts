import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { RepairService } from '../../../core/services/repair.service';
import { SocketService } from '../../../core/services/socket.service';
import { Notification } from '../../../core/models';

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html', styleUrls: ['./dashboard.component.scss'] })
export class DashboardComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  pendingOrders = 0;
  activeRepairs = 0;
  loading = false;
  private sub = new Subscription();

  constructor(
    private notifService: NotificationService,
    private orderService: OrderService,
    private repairService: RepairService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.notifService.getNotifications().subscribe(n => { this.notifications = n.slice(0, 10); this.loading = false; });
    this.notifService.unreadCount.subscribe(n => this.unreadCount = n);
    this.orderService.getAllOrders(1, 100).subscribe(r => {
      this.pendingOrders = r.data.filter(o => o.status === 'PENDING').length;
    });
    this.repairService.getAllRepairs(1, 100).subscribe(r => {
      this.activeRepairs = r.data.filter(rr => rr.status === 'IN_PROGRESS').length;
    });
    this.socket.connect();
    this.sub.add(this.socket.onNotification().subscribe(() => {
      this.notifService.getNotifications().subscribe(n => this.notifications = n.slice(0, 10));
    }));
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  markRead(id: string): void { this.notifService.markAsRead(id).subscribe(() => this.notifService.getNotifications().subscribe(n => this.notifications = n.slice(0, 10))); }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = { NEW_ORDER: '📦', NEW_REPAIR: '🔧', NEW_QUESTION: '❓', RECOVERY_CHOICE: '🚚' };
    return icons[type] ?? '🔔';
  }
}

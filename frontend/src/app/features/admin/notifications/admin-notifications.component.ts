import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { SocketService } from '../../../core/services/socket.service';
import { Notification } from '../../../core/models';

@Component({ selector: 'app-admin-notifications', templateUrl: './admin-notifications.component.html', styleUrls: ['../products/admin-products.component.scss'] })
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  private sub = new Subscription();

  constructor(
    private notifService: NotificationService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.load();
    this.socket.connect();
    this.sub.add(this.socket.onNotification().subscribe(() => this.load()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.notifService.getNotifications().subscribe({ next: n => { this.notifications = n; this.loading = false; }, error: () => this.loading = false });
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.notifService.markAsRead(n.id).subscribe(() => { n.isRead = true; });
  }

  getIcon(type: string): string {
    return { NEW_ORDER: '📦', NEW_REPAIR: '🔧', NEW_QUESTION: '❓', RECOVERY_CHOICE: '🚚' }[type] ?? '🔔';
  }
}

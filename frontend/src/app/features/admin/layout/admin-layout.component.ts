import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({ selector: 'app-admin-layout', templateUrl: './admin-layout.component.html', styleUrls: ['./admin-layout.component.scss'] })
export class AdminLayoutComponent implements OnInit {
  unreadCount = 0;

  constructor(
    public auth: AuthService,
    private notif: NotificationService,
    private socket: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notif.getUnreadCount().subscribe();
    this.notif.unreadCount.subscribe(n => this.unreadCount = n);
    this.socket.connect();
    this.socket.onNotification().subscribe(() => this.notif.getUnreadCount().subscribe());
  }

  logout(): void { this.auth.logout(); this.socket.disconnect(); }
}

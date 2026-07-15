import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SocketService } from '../../../core/services/socket.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  cartCount = 0;
  unreadCount = 0;
  mobileMenuOpen = false;
  profileMenuOpen = false;

  private subs = new Subscription();

  constructor(
    public auth: AuthService,
    private cart: CartService,
    private notifService: NotificationService,
    private socket: SocketService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.currentUser$.subscribe(u => {
        this.user = u;

        if (u?.role === 'ADMIN') {
          this.notifService.getUnreadCount().subscribe();
          this.socket.connect();

          this.subs.add(
            this.socket.onNotification().subscribe(() => {
              this.notifService.getUnreadCount().subscribe();
            })
          );
        }
      })
    );

    this.subs.add(
      this.cart.cart$.subscribe(items => {
        this.cartCount = items.reduce((s, i) => s + i.quantity, 0);
      })
    );

    this.subs.add(
      this.notifService.unreadCount.subscribe(n => this.unreadCount = n)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get isAuthPage(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/register');
  }

  get isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }

  get isRegisterPage(): boolean {
    return this.router.url.startsWith('/register');
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.mobileMenuOpen = false;
    this.auth.logout();
    this.socket.disconnect();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    if (this.mobileMenuOpen) {
      this.profileMenuOpen = false;
    }
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;

    if (this.profileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  closeMenus(): void {
    this.mobileMenuOpen = false;
    this.profileMenuOpen = false;
  }

  getInitials(): string {
    const name = this.user?.fullName?.trim();

    if (!name) {
      return 'U';
    }

    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  }

  isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }
}
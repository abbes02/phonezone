import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ClientGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated() && this.auth.currentUser()?.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  }
}

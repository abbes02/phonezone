import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    console.log('GUARD CHECK:', state.url);

    // ❌ NE BLOQUE PLUS CART
    if (state.url.includes('/cart')) {
      return true;
    }

    // ✅ AUTH NORMAL
    if (this.auth.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });

    return false;
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const STORAGE_KEY = 'phone_shop_auth';

type StoredAuth = AuthResponse & { user: User };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      })
      .pipe(tap((res) => this.storeAuth(res)));
  }

  register(
    fullName: string,
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        fullName,
        email: email.trim().toLowerCase(),
        password,
      })
      .pipe(tap((res) => this.storeAuth(res)));
  }

  logout(): void {
    const token = this.getToken();

    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        error: () => {},
      });
    }

    this.clearAuth();
    this.router.navigate(['/login']);
  }

  currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  getToken(): string | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const auth = JSON.parse(stored) as StoredAuth;
      return auth.access_token ?? null;
    } catch {
      this.clearAuth();
      return null;
    }
  }

  clearAuth(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  private storeAuth(res: AuthResponse): void {
    const normalized: AuthResponse = {
      ...res,
      user: {
        ...res.user,
        role: String(res.user.role).toUpperCase() as User['role'],
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    localStorage.removeItem('token');
    this.currentUserSubject.next(normalized.user);
  }

  private loadUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const auth = JSON.parse(stored) as StoredAuth;

      if (!auth.access_token || !auth.user) return null;

      return {
        ...auth.user,
        role: String(auth.user.role).toUpperCase() as User['role'],
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('token');
      return null;
    }
  }
}
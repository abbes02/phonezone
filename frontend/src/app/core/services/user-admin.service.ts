import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User, PaginatedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(
    page = 1,
    limit = 10,
    search?: string,
  ): Observable<PaginatedResult<User>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResult<User>>(this.url, { params });
  }

  updateRole(id: string, role: 'CLIENT' | 'ADMIN'): Observable<User> {
    return this.http.patch<User>(`${this.url}/${id}/role`, { role });
  }

  deactivate(id: string): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
      `${this.url}/${id}/deactivate`,
      {},
    );
  }

  activate(id: string): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
      `${this.url}/${id}/activate`,
      {},
    );
  }

  toggleStatus(id: string): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
      `${this.url}/${id}/toggle-status`,
      {},
    );
  }
}
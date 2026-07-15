import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount = this.unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/notifications/unread-count`).pipe(
      tap(res => this.unreadCount$.next(res.count))
    );
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCount$.value;
        if (current > 0) this.unreadCount$.next(current - 1);
      })
    );
  }

  setUnreadCount(count: number): void {
    this.unreadCount$.next(count);
  }
}

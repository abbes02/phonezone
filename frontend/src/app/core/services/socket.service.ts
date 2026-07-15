import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket?.connected) return;
    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(environment.socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  onNotification(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('notification', (data: any) => observer.next(data));
    });
  }

  onRepairStatusUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('repair-status-update', (data: any) => observer.next(data));
    });
  }

  onLoyaltyReward(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('loyalty-reward', (data: any) => observer.next(data));
    });
  }

  onQuestionAnswered(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('question-answered', (data: any) => observer.next(data));
    });
  }
}

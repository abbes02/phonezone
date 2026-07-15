import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  iat?: number;
  exp?: number;
}

@Injectable()
@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Called when a client connects.
   * Extracts the JWT from `socket.handshake.auth.token` or the
   * `Authorization` header, validates it, then assigns the socket to
   * the appropriate room ("admin" or "user:<userId>").
   * If the token is missing or invalid the socket is disconnected.
   */
  async handleConnection(socket: Socket): Promise<void> {
    try {
      const token = this.extractToken(socket);

      if (!token) {
        this.logger.warn(`Socket ${socket.id}: no token provided — disconnecting`);
        socket.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<JwtPayload>(token, { secret });

      if (payload.role === 'ADMIN') {
        await socket.join('admin');
        this.logger.log(`Socket ${socket.id}: ADMIN joined room "admin"`);
      } else if (payload.role === 'CLIENT') {
        const room = `user:${payload.sub}`;
        await socket.join(room);
        this.logger.log(`Socket ${socket.id}: CLIENT joined room "${room}"`);
      } else {
        this.logger.warn(`Socket ${socket.id}: unknown role "${payload.role}" — disconnecting`);
        socket.disconnect();
      }
    } catch {
      this.logger.warn(`Socket ${socket.id}: invalid token — disconnecting`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket): void {
    this.logger.log(`Socket ${socket.id} disconnected`);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Extracts the JWT from either `socket.handshake.auth.token`
   * or the `Authorization: Bearer <token>` header.
   */
  private extractToken(socket: Socket): string | null {
    // 1) socket.handshake.auth.token  (preferred, sent by socket.io client)
    const authToken = socket.handshake.auth?.token as string | undefined;
    if (authToken) {
      return authToken;
    }

    // 2) Authorization header  (Bearer scheme)
    const authHeader = socket.handshake.headers?.authorization as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }
}

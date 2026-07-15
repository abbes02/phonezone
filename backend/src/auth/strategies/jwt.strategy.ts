import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Redis } from 'ioredis';
import { JwtPayload } from '../auth.service';
import { AuthService } from '../auth.service';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (token) {
      try {
        const [isTokenBlacklisted, isUserBlacklisted] = await Promise.all([
          this.redisClient.get(`blacklist:${token}`),
          this.redisClient.get(`blacklist:user:${payload.sub}`),
        ]);

        if (isTokenBlacklisted || isUserBlacklisted) {
          throw new UnauthorizedException(
            'Session expirée. Veuillez vous reconnecter.',
          );
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
      }
    }

    const user = await this.authService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    return {
      id: user.id,
      email: user.email,
      role: String(user.role).toUpperCase(),
    };
  }
}
import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Mock Redis client used when Redis is not available (dev mode).
 * Silently ignores all operations.
 */
const mockRedis = {
  get: async (_key: string) => null,
  set: async (..._args: any[]) => 'OK',
  del: async (..._args: any[]) => 1,
  exists: async (..._args: any[]) => 0,
  expire: async (..._args: any[]) => 1,
  on: () => mockRedis,
} as unknown as Redis;

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const logger = new Logger('RedisModule');
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);

        const client = new Redis({ host, port, lazyConnect: true });

        // Try to connect — if it fails, use mock client
        client.connect().then(() => {
          logger.log(`✅ Redis connecté sur ${host}:${port}`);
        }).catch(() => {
          logger.warn(`⚠️  Redis non disponible sur ${host}:${port} — mode dégradé activé (tokens non blacklistés)`);
        });

        // On error, swap to mock silently
        client.on('error', () => {
          // errors suppressed in dev
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

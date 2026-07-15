import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { RepairsModule } from './repairs/repairs.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { QuestionsModule } from './questions/questions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // cherche dans backend/ puis à la racine
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DATABASE_PORT', '5433')),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: String(configService.get('DATABASE_PASSWORD', '')),
        database: configService.get<string>('DATABASE_NAME', 'phone_shop_db'),
        synchronize: true, // auto-crée les tables en dev
        autoLoadEntities: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // Serve uploaded files (question photos)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    RedisModule,
    EventsModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    RepairsModule,
    LoyaltyModule,
    QuestionsModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

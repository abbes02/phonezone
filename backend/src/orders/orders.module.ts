import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairService } from './entities/repair-service.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { RepairServiceManager } from './repair-service.service';
import { OrdersService } from './orders.service';
import { RepairServiceController } from './repair-service.controller';
import { OrdersController } from './orders.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepairService, Order, OrderItem, Product]),
    AuthModule,
    NotificationsModule,
    LoyaltyModule,
  ],
  controllers: [RepairServiceController, OrdersController],
  providers: [RepairServiceManager, OrdersService],
  exports: [RepairServiceManager, OrdersService],
})
export class OrdersModule {}

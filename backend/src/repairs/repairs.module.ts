import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairRequest } from './entities/repair-request.entity';
import { RepairStatusHistory } from './entities/repair-status-history.entity';
import { RepairsService } from './repairs.service';
import { RepairsController } from './repairs.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from '../events/events.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepairRequest, RepairStatusHistory]),
    AuthModule,
    NotificationsModule,
    EventsModule,
    LoyaltyModule,
  ],
  controllers: [RepairsController],
  providers: [RepairsService],
  exports: [RepairsService],
})
export class RepairsModule {}

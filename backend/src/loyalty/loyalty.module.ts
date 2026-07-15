import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyCounter } from './entities/loyalty-counter.entity';
import { LoyaltyVoucher } from './entities/loyalty-voucher.entity';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyCounter, LoyaltyVoucher]),
    AuthModule,
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}

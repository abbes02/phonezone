import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/entities/user.entity';

interface AuthRequest extends Request {
  user: { id: string; email: string; role: UserRole };
}

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  /** GET /api/loyalty/mine — Client */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@Req() req: AuthRequest) {
    return this.loyaltyService.getLoyaltyData(req.user.id);
  }
}

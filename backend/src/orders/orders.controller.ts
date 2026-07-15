import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { OrdersService, PaginationQuery } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

interface AuthRequest extends Request {
  user: { id: string; email: string; role: UserRole };
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/orders — Client (JWT)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createOrder(@Request() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  /**
   * GET /api/orders/mine — Client
   */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req: AuthRequest) {
    return this.ordersService.findMine(req.user.id);
  }

  /**
   * GET /api/orders — Admin
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query: PaginationQuery = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.ordersService.findAll(query);
  }

  /**
   * GET /api/orders/:id — Auth
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  /**
   * PATCH /api/orders/:id/status — Admin
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}

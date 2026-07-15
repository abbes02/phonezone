import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthRequest,
  ) {
    return this.usersService.updateRole(id, dto.role, req.user.id);
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.usersService.deactivate(id, req.user.id);
  }

  @Patch(':id/activate')
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activate(id);
  }

  @Patch(':id/toggle-status')
  toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.usersService.toggleStatus(id, req.user.id);
  }
}
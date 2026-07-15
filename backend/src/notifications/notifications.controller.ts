import { Controller, Get, Param, Patch, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** GET /api/notifications — Admin */
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  /** GET /api/notifications/unread-count — Admin */
  @Get('unread-count')
  countUnread() {
    return this.notificationsService.countUnread();
  }

  /** PATCH /api/notifications/:id/read — Admin */
  @Patch(':id/read')
  markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markAsRead(id);
  }
}

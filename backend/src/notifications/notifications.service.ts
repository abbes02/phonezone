import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { EventsGateway } from '../events/events.gateway';

export interface CreateNotificationDto {
  type: NotificationType;
  message: string;
  clientName: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepo.create({
      type: dto.type,
      message: dto.message,
      clientName: dto.clientName,
      relatedEntityId: dto.relatedEntityId,
      relatedEntityType: dto.relatedEntityType,
      isRead: false,
    });
    const saved = await this.notificationRepo.save(notification);

    // Emit real-time WebSocket event to admin room
    this.eventsGateway.server.to('admin').emit('notification', {
      id: saved.id,
      type: saved.type,
      message: saved.message,
      clientName: saved.clientName,
      relatedEntityId: saved.relatedEntityId,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async countUnread(): Promise<{ count: number }> {
    const count = await this.notificationRepo.count({ where: { isRead: false } });
    return { count };
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification "${id}" introuvable`);
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}

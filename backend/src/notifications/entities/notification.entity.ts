import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  NEW_REPAIR = 'NEW_REPAIR',
  NEW_QUESTION = 'NEW_QUESTION',
  RECOVERY_CHOICE = 'RECOVERY_CHOICE',
  LOYALTY_REWARD = 'LOYALTY_REWARD',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    enumName: 'notification_type_enum',
    default: NotificationType.NEW_ORDER,
  })
  type!: NotificationType;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', nullable: true })
  relatedEntityId?: string;

  @Column({ type: 'varchar', nullable: true })
  relatedEntityType?: string;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'varchar', length: 255, default: 'Client' })
  clientName!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}

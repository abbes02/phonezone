import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum OrderDeliveryOption {
  PICKUP = 'PICKUP',
  HOME_DELIVERY = 'HOME_DELIVERY',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  orderNumber!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 20, default: OrderDeliveryOption.HOME_DELIVERY })
  deliveryOption!: OrderDeliveryOption;

  @Column({ type: 'varchar', length: 500, nullable: true })
  deliveryAddress?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  deliveryCity?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  deliveryPhone?: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

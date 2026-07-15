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
import { RepairService } from '../../orders/entities/repair-service.entity';
import { RepairStatusHistory } from './repair-status-history.entity';

export enum RepairStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
}

export enum RecoveryOption {
  IN_STORE = 'IN_STORE',
  HOME_DELIVERY = 'HOME_DELIVERY',
}

export enum DropOffOption {
  IN_STORE = 'IN_STORE',
  PICKUP_BY_DELIVERY = 'PICKUP_BY_DELIVERY',
}

@Entity('repair_requests')
export class RepairRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  referenceNumber!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  serviceId!: string;

  @ManyToOne(() => RepairService, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'serviceId' })
  service!: RepairService;

  @Column({ type: 'varchar', length: 255 })
  phoneModel!: string;

  @Column({ type: 'text' })
  problemDescription!: string;

  @Column({ type: 'varchar', length: 255 })
  contactInfo!: string;

  @Column({ type: 'simple-array', nullable: true, default: '' })
  photoUrls!: string[];

  @Column({ type: 'timestamp', nullable: true })
  desiredDropOffSlot?: Date;

  @Column({
    type: 'varchar',
    length: 30,
    default: DropOffOption.IN_STORE,
  })
  dropOffOption!: DropOffOption;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pickupAddress?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pickupCity?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  pickupPhone?: string;

  @Column({ type: 'timestamp', nullable: true })
  pickupSlot?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status!: RepairStatus;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  recoveryOption?: RecoveryOption;

  @Column({ type: 'varchar', length: 500, nullable: true })
  deliveryAddress?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  deliveryCity?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  deliveryPhone?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalPrice?: number;

  @Column({ type: 'boolean', default: false })
  discountApplied!: boolean;

  @OneToMany(() => RepairStatusHistory, (history) => history.repairRequest, {
    cascade: true,
  })
  statusHistory!: RepairStatusHistory[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
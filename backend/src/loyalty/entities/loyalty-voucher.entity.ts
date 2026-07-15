import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum VoucherType {
  SCREEN_PROTECTOR_FREE = 'SCREEN_PROTECTOR_FREE',
  REPAIR_DISCOUNT_50 = 'REPAIR_DISCOUNT_50',
}

@Entity('loyalty_vouchers')
export class LoyaltyVoucher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'varchar',
    length: 30,
  })
  type!: VoucherType;

  @Column({ type: 'boolean', default: false })
  isUsed!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  generatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt?: Date;
}

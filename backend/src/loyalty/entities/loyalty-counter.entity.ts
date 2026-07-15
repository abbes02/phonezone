import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('loyalty_counters')
export class LoyaltyCounter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'int', default: 0 })
  screenProtectorCount!: number;

  @Column({ type: 'int', default: 0 })
  repairCount!: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

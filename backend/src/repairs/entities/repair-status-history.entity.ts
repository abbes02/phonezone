import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RepairRequest, RepairStatus } from './repair-request.entity';

@Entity('repair_status_history')
export class RepairStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  repairRequestId!: string;

  @ManyToOne(() => RepairRequest, (r) => r.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repairRequestId' })
  repairRequest!: RepairRequest;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status!: RepairStatus;

  @CreateDateColumn({ type: 'timestamp' })
  changedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  changedByAdminId?: string;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  questionNumber!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'simple-array', nullable: true, default: '' })
  photoUrls!: string[];

  @Column({ type: 'boolean', default: false })
  isAnswered!: boolean;

  @Column({ type: 'text', nullable: true })
  adminResponse?: string;

  @Column({ type: 'timestamp', nullable: true })
  answeredAt?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}

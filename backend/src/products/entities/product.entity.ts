import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductCategory {
  PHONE = 'PHONE',
  ACCESSORY = 'ACCESSORY',
  SCREEN_PROTECTOR = 'SCREEN_PROTECTOR',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    enumName: 'product_category_enum',
    nullable: true,
    default: ProductCategory.ACCESSORY,
  })
  category!: ProductCategory | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity!: number;

  @Column({ type: 'simple-array', nullable: true, default: '' })
  imageUrls!: string[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
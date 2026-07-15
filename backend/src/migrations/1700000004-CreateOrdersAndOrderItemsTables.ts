import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrdersAndOrderItemsTables1700000004 implements MigrationInterface {
  name = 'CreateOrdersAndOrderItemsTables1700000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'orderNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'order_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'orderId',
            type: 'uuid',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'isScreenProtector',
            type: 'boolean',
            default: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['orderId'],
            referencedTableName: 'orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['productId'],
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_items');
    await queryRunner.dropTable('orders');
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
  }
}

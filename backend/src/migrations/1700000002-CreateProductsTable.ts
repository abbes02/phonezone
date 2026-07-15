import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductsTable1700000002 implements MigrationInterface {
  name = 'CreateProductsTable1700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "product_category_enum" AS ENUM('PHONE', 'ACCESSORY', 'SCREEN_PROTECTOR')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'category',
            type: 'enum',
            enumName: 'product_category_enum',
            isNullable: true,
            default: "'ACCESSORY'",
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'stockQuantity',
            type: 'int',
            default: 0,
          },
          {
            name: 'imageUrls',
            type: 'text',
            isNullable: true,
            default: "''",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
    await queryRunner.query(`DROP TYPE "product_category_enum"`);
  }
}

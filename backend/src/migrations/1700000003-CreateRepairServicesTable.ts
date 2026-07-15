import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRepairServicesTable1700000003 implements MigrationInterface {
  name = 'CreateRepairServicesTable1700000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'repair_services',
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
            name: 'indicativePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
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
    await queryRunner.dropTable('repair_services');
  }
}

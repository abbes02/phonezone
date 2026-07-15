import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRepairRequestsTable1700000005 implements MigrationInterface {
  name = 'CreateRepairRequestsTable1700000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "repair_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'READY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "recovery_option_enum" AS ENUM('IN_STORE', 'HOME_DELIVERY')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'repair_requests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'referenceNumber', type: 'varchar', isUnique: true },
          { name: 'userId', type: 'uuid' },
          { name: 'serviceId', type: 'uuid' },
          { name: 'phoneModel', type: 'varchar', length: '255' },
          { name: 'problemDescription', type: 'text' },
          { name: 'contactInfo', type: 'varchar', length: '255' },
          { name: 'desiredDropOffSlot', type: 'timestamp', isNullable: true },
          { name: 'status', type: 'enum', enumName: 'repair_status_enum', default: "'PENDING'" },
          { name: 'recoveryOption', type: 'enum', enumName: 'recovery_option_enum', isNullable: true },
          { name: 'deliveryAddress', type: 'varchar', length: '500', isNullable: true },
          { name: 'finalPrice', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'discountApplied', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('repair_requests', new TableForeignKey({
      columnNames: ['userId'], referencedColumnNames: ['id'], referencedTableName: 'users', onDelete: 'RESTRICT',
    }));
    await queryRunner.createForeignKey('repair_requests', new TableForeignKey({
      columnNames: ['serviceId'], referencedColumnNames: ['id'], referencedTableName: 'repair_services', onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('repair_requests');
    await queryRunner.query(`DROP TYPE "repair_status_enum"`);
    await queryRunner.query(`DROP TYPE "recovery_option_enum"`);
  }
}

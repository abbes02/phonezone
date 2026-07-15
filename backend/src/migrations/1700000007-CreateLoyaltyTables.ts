import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLoyaltyTables1700000007 implements MigrationInterface {
  name = 'CreateLoyaltyTables1700000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // loyalty_counters
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_counters',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid', isUnique: true },
          { name: 'screenProtectorCount', type: 'int', default: 0 },
          { name: 'repairCount', type: 'int', default: 0 },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey('loyalty_counters', new TableForeignKey({
      columnNames: ['userId'], referencedColumnNames: ['id'], referencedTableName: 'users', onDelete: 'CASCADE',
    }));

    // loyalty_vouchers
    await queryRunner.query(
      `CREATE TYPE "voucher_type_enum" AS ENUM('SCREEN_PROTECTOR_FREE', 'REPAIR_DISCOUNT_50')`,
    );
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_vouchers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid' },
          { name: 'type', type: 'enum', enumName: 'voucher_type_enum' },
          { name: 'isUsed', type: 'boolean', default: false },
          { name: 'generatedAt', type: 'timestamp', default: 'now()' },
          { name: 'usedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey('loyalty_vouchers', new TableForeignKey({
      columnNames: ['userId'], referencedColumnNames: ['id'], referencedTableName: 'users', onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('loyalty_vouchers');
    await queryRunner.query(`DROP TYPE "voucher_type_enum"`);
    await queryRunner.dropTable('loyalty_counters');
  }
}

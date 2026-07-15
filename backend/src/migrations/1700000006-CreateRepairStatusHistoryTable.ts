import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRepairStatusHistoryTable1700000006 implements MigrationInterface {
  name = 'CreateRepairStatusHistoryTable1700000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'repair_status_history',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'repairRequestId', type: 'uuid' },
          { name: 'status', type: 'enum', enumName: 'repair_status_enum' },
          { name: 'changedAt', type: 'timestamp', default: 'now()' },
          { name: 'changedByAdminId', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('repair_status_history', new TableForeignKey({
      columnNames: ['repairRequestId'], referencedColumnNames: ['id'], referencedTableName: 'repair_requests', onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('repair_status_history');
  }
}

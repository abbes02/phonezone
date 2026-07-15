import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1700000009 implements MigrationInterface {
  name = 'CreateNotificationsTable1700000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "notification_type_enum" AS ENUM('NEW_ORDER', 'NEW_REPAIR', 'NEW_QUESTION', 'RECOVERY_CHOICE', 'LOYALTY_REWARD')`,
    );
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          {
            name: 'type',
            type: 'enum',
            enumName: 'notification_type_enum',
            default: "'NEW_ORDER'",
          },
          { name: 'message', type: 'text' },
          { name: 'relatedEntityId', type: 'varchar', isNullable: true },
          { name: 'relatedEntityType', type: 'varchar', isNullable: true },
          { name: 'isRead', type: 'boolean', default: false },
          { name: 'clientName', type: 'varchar', length: '255', default: "'Client'" },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
  }
}

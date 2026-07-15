import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateQuestionsTable1700000008 implements MigrationInterface {
  name = 'CreateQuestionsTable1700000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'questions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'questionNumber', type: 'varchar', isUnique: true },
          { name: 'userId', type: 'uuid' },
          { name: 'subject', type: 'varchar', length: '255' },
          { name: 'description', type: 'text' },
          { name: 'photoUrls', type: 'text', isNullable: true, default: "''" },
          { name: 'isAnswered', type: 'boolean', default: false },
          { name: 'adminResponse', type: 'text', isNullable: true },
          { name: 'answeredAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey('questions', new TableForeignKey({
      columnNames: ['userId'], referencedColumnNames: ['id'], referencedTableName: 'users', onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('questions');
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeRepairServicePriceOptionalAndAddImage1700000010 implements MigrationInterface {
  name = 'MakeRepairServicePriceOptionalAndAddImage1700000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasImageUrl = await queryRunner.hasColumn('repair_services', 'imageUrl');
    if (!hasImageUrl) {
      await queryRunner.addColumn(
        'repair_services',
        new TableColumn({
          name: 'imageUrl',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    await queryRunner.changeColumn(
      'repair_services',
      'indicativePrice',
      new TableColumn({
        name: 'indicativePrice',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasImageUrl = await queryRunner.hasColumn('repair_services', 'imageUrl');
    if (hasImageUrl) {
      await queryRunner.dropColumn('repair_services', 'imageUrl');
    }

    await queryRunner.changeColumn(
      'repair_services',
      'indicativePrice',
      new TableColumn({
        name: 'indicativePrice',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
      }),
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUnit1765059680317 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO units (id, name, symbol, "metricType", "createdAt")
      VALUES
        (gen_random_uuid(), 'METER', 'm', 'DISTANCE', NOW()),
        (gen_random_uuid(), 'CENTIMETER', 'cm', 'DISTANCE', NOW()),
        (gen_random_uuid(), 'INCH', 'in', 'DISTANCE', NOW()),
        (gen_random_uuid(), 'FEET', 'ft', 'DISTANCE', NOW()),
        (gen_random_uuid(), 'YARD', 'yd', 'DISTANCE', NOW()),
        (gen_random_uuid(), 'CELSIUS', '°C', 'TEMPERATURE', NOW()),
        (gen_random_uuid(), 'FAHRENHEIT', '°F', 'TEMPERATURE', NOW()),
        (gen_random_uuid(), 'KELVIN', 'K', 'TEMPERATURE', NOW())
      ON CONFLICT (name) DO NOTHING;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM units WHERE name IN (
        'METER', 'CENTIMETER', 'INCH', 'FEET', 'YARD',
        'CELSIUS', 'FAHRENHEIT', 'KELVIN'
      );
    `);
  }
}

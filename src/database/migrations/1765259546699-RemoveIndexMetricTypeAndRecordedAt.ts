import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIndexMetricTypeAndRecordedAt1765259546699 implements MigrationInterface {
  name = 'RemoveIndexMetricTypeAndRecordedAt1765259546699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8711e229c7fc0a0ca489ba7419"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_8711e229c7fc0a0ca489ba7419" ON "metric_records" ("metricType", "recordedAt") `,
    );
  }
}

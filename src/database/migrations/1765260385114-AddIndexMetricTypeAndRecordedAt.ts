import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexMetricTypeAndRecordedAt1765260385114 implements MigrationInterface {
  name = 'AddIndexMetricTypeAndRecordedAt1765260385114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_8711e229c7fc0a0ca489ba7419" ON "metric_records" ("metricType", "recordedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0df2336342d657fcab5d468b44" ON "metric_records" ("metricType", (date("recordedAt")) DESC, "createdAt" DESC) `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0df2336342d657fcab5d468b44"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8711e229c7fc0a0ca489ba7419"`,
    );
  }
}

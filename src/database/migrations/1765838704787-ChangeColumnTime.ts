import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeColumnTime1765838704787 implements MigrationInterface {
  name = 'ChangeColumnTime1765838704787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55fad1a7fe9c48819e037017e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5df3aa49bf263f3bdf530eba83"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8711e229c7fc0a0ca489ba7419"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0df2336342d657fcab5d468b44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metric_records" ALTER COLUMN "recordedAt" TYPE TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "metric_records" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metric_records" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "metric_records" ALTER COLUMN "recordedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0df2336342d657fcab5d468b44" ON "metric_records" ("createdAt", "metricType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8711e229c7fc0a0ca489ba7419" ON "metric_records" ("metricType", "recordedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5df3aa49bf263f3bdf530eba83" ON "metric_records" ("metricType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55fad1a7fe9c48819e037017e6" ON "metric_records" ("id", "recordedAt") `,
    );
  }
}

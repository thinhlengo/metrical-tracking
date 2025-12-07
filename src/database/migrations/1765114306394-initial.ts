import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1765114306394 implements MigrationInterface {
  name = 'Initial1765114306394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."metric_records_metrictype_enum" AS ENUM('DISTANCE', 'TEMPERATURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "metric_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" numeric(20,10) NOT NULL, "metricType" "public"."metric_records_metrictype_enum" NOT NULL, "source" jsonb, "recordedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6b1ada67fc6d6c4d1fc615dd18c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55fad1a7fe9c48819e037017e6" ON "metric_records" ("id", "recordedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8711e229c7fc0a0ca489ba7419" ON "metric_records" ("metricType", "recordedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5df3aa49bf263f3bdf530eba83" ON "metric_records" ("metricType") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5df3aa49bf263f3bdf530eba83"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8711e229c7fc0a0ca489ba7419"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55fad1a7fe9c48819e037017e6"`,
    );
    await queryRunner.query(`DROP TABLE "metric_records"`);
    await queryRunner.query(
      `DROP TYPE "public"."metric_records_metrictype_enum"`,
    );
  }
}

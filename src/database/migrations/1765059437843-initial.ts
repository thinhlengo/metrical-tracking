import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1765059437843 implements MigrationInterface {
  name = 'Initial1765059437843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."metric_records_metrictype_enum" AS ENUM('DISTANCE', 'TEMPERATURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "metric_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" numeric(20,10) NOT NULL, "metricType" "public"."metric_records_metrictype_enum" NOT NULL, "source" jsonb, "recordedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6b1ada67fc6d6c4d1fc615dd18c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."units_metrictype_enum" AS ENUM('DISTANCE', 'TEMPERATURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "units" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "symbol" character varying(10) NOT NULL, "metricType" "public"."units_metrictype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cd34e4bfea359fa09d997a0b87d" UNIQUE ("name"), CONSTRAINT "PK_5a8f2f064919b587d93936cb223" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "units"`);
    await queryRunner.query(`DROP TYPE "public"."units_metrictype_enum"`);
    await queryRunner.query(`DROP TABLE "metric_records"`);
    await queryRunner.query(
      `DROP TYPE "public"."metric_records_metrictype_enum"`,
    );
  }
}

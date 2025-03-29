import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPityThresholdToGacha1709123456797 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gachas" ADD COLUMN "pityThreshold" integer DEFAULT 50`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gachas" DROP COLUMN "pityThreshold"`);
    }
}
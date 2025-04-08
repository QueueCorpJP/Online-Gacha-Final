import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsOneTimeFreeEnabled1234567890123 implements MigrationInterface {
    name = 'AddIsOneTimeFreeEnabled1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gachas" ADD "isOneTimeFreeEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gachas" DROP COLUMN "isOneTimeFreeEnabled"`);
    }
}
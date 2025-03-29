import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExchangeRateToGachaItem1709123456798 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gacha_item" ADD COLUMN "exchangeRate" decimal(10,2) NOT NULL DEFAULT 1.00`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gacha_item" DROP COLUMN "exchangeRate"`);
    }
}
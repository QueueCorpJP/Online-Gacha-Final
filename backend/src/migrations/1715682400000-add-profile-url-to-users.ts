import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileUrlToUsers1715682400000 implements MigrationInterface {
    name = 'AddProfileUrlToUsers1715682400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profileUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileUrl"`);
    }
} 
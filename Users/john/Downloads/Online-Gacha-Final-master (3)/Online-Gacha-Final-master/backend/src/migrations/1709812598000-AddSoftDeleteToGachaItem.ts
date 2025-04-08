import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToGachaItem1709812598000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add deletedAt column
        await queryRunner.query(`
            ALTER TABLE "gacha_item"
            ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate status column
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE item_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "gacha_item"
            ADD COLUMN IF NOT EXISTS "status" item_status_enum DEFAULT 'ACTIVE';
        `);

        // Convert soft deleted items back to INACTIVE status
        await queryRunner.query(`
            UPDATE "gacha_item"
            SET "status" = 'INACTIVE'
            WHERE "deletedAt" IS NOT NULL;
        `);

        // Drop deletedAt column
        await queryRunner.query(`
            ALTER TABLE "gacha_item"
            DROP COLUMN IF EXISTS "deletedAt";
        `);

        // Drop the enum type if it's no longer needed
        await queryRunner.query(`
            DROP TYPE IF EXISTS item_status_enum;
        `);
    }
}
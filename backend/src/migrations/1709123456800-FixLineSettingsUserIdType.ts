import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLineSettingsUserIdType1709123456800 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop the existing foreign key if it exists
        await queryRunner.query(`
            DO $$ BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_line_settings_user' 
                    AND table_name = 'line_settings'
                ) THEN
                    ALTER TABLE "line_settings" DROP CONSTRAINT "FK_line_settings_user";
                END IF;
            END $$;
        `);

        // Alter the column type to UUID
        await queryRunner.query(`
            ALTER TABLE "line_settings" 
            ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid;
        `);

        // Recreate the foreign key
        await queryRunner.query(`
            ALTER TABLE "line_settings"
            ADD CONSTRAINT "FK_line_settings_user"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key
        await queryRunner.query(`
            ALTER TABLE "line_settings" DROP CONSTRAINT "FK_line_settings_user";
        `);

        // Convert back to varchar
        await queryRunner.query(`
            ALTER TABLE "line_settings" 
            ALTER COLUMN "userId" TYPE character varying;
        `);
    }
}
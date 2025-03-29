import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInventoryStatusEnum1234567890123 implements MigrationInterface {
    name = 'UpdateInventoryStatusEnum1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, remove the default value constraint
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" DROP DEFAULT;
        `);

        // Then alter the column to varchar temporarily
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" TYPE VARCHAR(255)
        `);

        // Now we can safely drop the enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "inventory_status_enum";
        `);

        // Create the new enum type with additional values
        await queryRunner.query(`
            CREATE TYPE "inventory_status_enum" AS ENUM ('available', 'exchanged', 'locked', 'shipped', 'shipping')
        `);

        // Convert column back to enum type
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" TYPE "inventory_status_enum" 
            USING status::inventory_status_enum
        `);

        // Restore the default value
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" SET DEFAULT 'available'::inventory_status_enum
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove default value first
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" DROP DEFAULT
        `);

        // Convert to varchar temporarily
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" TYPE VARCHAR(255)
        `);

        // Drop the enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "inventory_status_enum"
        `);

        // Recreate the original enum type
        await queryRunner.query(`
            CREATE TYPE "inventory_status_enum" AS ENUM ('available', 'exchanged', 'locked')
        `);

        // Convert back to enum type
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" TYPE "inventory_status_enum" 
            USING status::inventory_status_enum
        `);

        // Restore the original default value
        await queryRunner.query(`
            ALTER TABLE "inventory" 
            ALTER COLUMN "status" SET DEFAULT 'available'::inventory_status_enum
        `);
    }
}


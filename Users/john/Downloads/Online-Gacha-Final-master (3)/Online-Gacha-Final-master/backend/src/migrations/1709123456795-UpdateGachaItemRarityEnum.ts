import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGachaItemRarityEnum1709123456795 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop the default value constraint
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" DROP DEFAULT;
        `);

        // Then alter the column to varchar temporarily
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" TYPE VARCHAR(255);
        `);
        
        // Now we can safely drop the enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "gacha_item_rarity_enum";
        `);

        // Create new enum type with A-E values
        await queryRunner.query(`
            CREATE TYPE "gacha_item_rarity_enum" AS ENUM ('A', 'B', 'C', 'D', 'E');
        `);

        // Convert existing values to match new enum (if needed)
        await queryRunner.query(`
            UPDATE "gacha_item"
            SET "rarity" = CASE 
                WHEN "rarity" = 'normal' THEN 'C'
                WHEN "rarity" = 'rare' THEN 'B'
                WHEN "rarity" = 'super-rare' THEN 'A'
                ELSE 'C'
            END;
        `);

        // Convert column back to enum type
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" TYPE "gacha_item_rarity_enum" 
            USING "rarity"::"gacha_item_rarity_enum";
        `);

        // Set default value
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" SET DEFAULT 'C'::"gacha_item_rarity_enum";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First, drop the default value constraint
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" DROP DEFAULT;
        `);

        // Then alter the column to varchar temporarily
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" TYPE VARCHAR(255);
        `);
        
        // Now we can safely drop the enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "gacha_item_rarity_enum";
        `);

        // Create the original enum type
        await queryRunner.query(`
            CREATE TYPE "gacha_item_rarity_enum" AS ENUM ('normal', 'rare', 'super-rare');
        `);

        // Convert values back to original format
        await queryRunner.query(`
            UPDATE "gacha_item"
            SET "rarity" = CASE 
                WHEN "rarity" = 'A' THEN 'super-rare'
                WHEN "rarity" = 'B' THEN 'rare'
                WHEN "rarity" IN ('C', 'D', 'E') THEN 'normal'
                ELSE 'normal'
            END;
        `);

        // Convert column back to enum type
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" TYPE "gacha_item_rarity_enum" 
            USING "rarity"::"gacha_item_rarity_enum";
        `);

        // Set default value
        await queryRunner.query(`
            ALTER TABLE "gacha_item" 
            ALTER COLUMN "rarity" SET DEFAULT 'normal'::"gacha_item_rarity_enum";
        `);
    }
}

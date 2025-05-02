import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNewsBlogTypeEnumValues1709123456793 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop the existing enum type constraint
       
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."news_blogs_type_enum" AS ENUM (
                    'news',
                    'event',
                    'campaign',
                    'card-info',
                    'other'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "news_blog"
            ADD COLUMN IF NOT EXISTS "type" "news_blogs_type_enum" DEFAULT 'news';
        `);

        // Drop the existing enum typ
        // Convert existing values to match new enum

        // Convert column back to enum type
        await queryRunner.query(`
            ALTER TABLE "news_blog" 
            ALTER COLUMN "type" TYPE "public"."news_blogs_type_enum" 
            USING type::"public"."news_blogs_type_enum";
        `);

        // Set default value
        await queryRunner.query(`
            ALTER TABLE "news_blog" 
            ALTER COLUMN "type" SET DEFAULT 'news'::"public"."news_blogs_type_enum";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes in case of rollback
        await queryRunner.query(`
            ALTER TABLE "news_blog" 
            ALTER COLUMN "type" DROP DEFAULT;
        `);
        
        await queryRunner.query(`
            ALTER TABLE "news_blog" 
            ALTER COLUMN "type" TYPE VARCHAR;
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."news_blogs_type_enum";
        `);

        // Recreate original enum type
        await queryRunner.query(`
            CREATE TYPE "public"."news_blogs_type_enum" AS ENUM ('news', 'blog', 'event');
        `);

        // Convert column back to original enum type
        await queryRunner.query(`
            ALTER TABLE "news_blog" 
            ALTER COLUMN "type" TYPE "public"."news_blogs_type_enum" 
            USING CASE 
                WHEN "type" IN ('campaign', 'card-info', 'other') THEN 'news'
                ELSE type
            END::"public"."news_blogs_type_enum";
        `);

        // Reset default value
        await queryRunner.query(`
            ALTER TABLE "news_blog" 
            ALTER COLUMN "type" SET DEFAULT 'news'::"public"."news_blogs_type_enum";
        `);
    }
}

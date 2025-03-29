import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampColumns1709123456794 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add createdAt and updatedAt columns
        await queryRunner.query(`
            ALTER TABLE "news_blog"
            ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now();
        `);

        // Add trigger to automatically update updatedAt
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW."updatedAt" = now();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_news_blog_updated_at ON "news_blog";
            CREATE TRIGGER update_news_blog_updated_at
                BEFORE UPDATE ON "news_blog"
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger and function
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_news_blog_updated_at ON "news_blog";
            DROP FUNCTION IF EXISTS update_updated_at_column();
        `);

        // Drop columns
        await queryRunner.query(`
            ALTER TABLE "news_blog"
            DROP COLUMN IF EXISTS "updatedAt",
            DROP COLUMN IF EXISTS "createdAt";
        `);
    }
}
import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeInquiryUserIdNullable1708521700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "userId" DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // In the down migration, we'll need to handle any NULL values before making it NOT NULL
        await queryRunner.query(`
            UPDATE "inquiries" 
            SET "userId" = '00000000-0000-0000-0000-000000000000' 
            WHERE "userId" IS NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "userId" SET NOT NULL;
        `);
    }
}
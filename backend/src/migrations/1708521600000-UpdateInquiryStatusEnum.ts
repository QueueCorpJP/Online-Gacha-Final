import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInquiryStatusEnum1708521600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, we'll drop existing enum type constraints
        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" DROP DEFAULT;
        `);
        
        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" TYPE VARCHAR;
        `);

        // Drop the existing enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "inquiries_status_enum";
        `);

        // Create new enum type with correct values
        await queryRunner.query(`
            CREATE TYPE "inquiries_status_enum" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');
        `);

        // Convert column back to enum type
        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" TYPE "inquiries_status_enum" 
            USING status::"inquiries_status_enum";
        `);

        // Set default value
        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" SET DEFAULT 'PENDING'::"inquiries_status_enum";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" DROP DEFAULT;
        `);

        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" TYPE VARCHAR;
        `);

        await queryRunner.query(`
            DROP TYPE "inquiries_status_enum";
        `);

        await queryRunner.query(`
            CREATE TYPE "inquiries_status_enum" AS ENUM ('未対応', '対応中', '対応済み');
        `);

        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" TYPE "inquiries_status_enum" 
            USING (
                CASE status 
                    WHEN 'PENDING' THEN '未対応'
                    WHEN 'IN_PROGRESS' THEN '対応中'
                    WHEN 'RESOLVED' THEN '対応済み'
                    ELSE '未対応'
                END
            )::"inquiries_status_enum";
        `);

        await queryRunner.query(`
            ALTER TABLE "inquiries" 
            ALTER COLUMN "status" SET DEFAULT '未対応'::"inquiries_status_enum";
        `);
    }
}
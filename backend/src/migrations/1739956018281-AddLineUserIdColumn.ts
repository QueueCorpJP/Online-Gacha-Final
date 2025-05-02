import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLineUserIdColumn1709123456791 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("line_settings", 
            new TableColumn({
                name: "lineUserId",
                type: "varchar",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("line_settings", "lineUserId");
    }
}
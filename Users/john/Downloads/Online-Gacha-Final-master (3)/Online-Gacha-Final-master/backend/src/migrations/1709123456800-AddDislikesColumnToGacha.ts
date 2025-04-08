import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDislikesColumnToGacha1709123456800 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("gachas", new TableColumn({
            name: "dislikes",
            type: "integer",
            default: 0,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("gachas", "dislikes");
    }
}

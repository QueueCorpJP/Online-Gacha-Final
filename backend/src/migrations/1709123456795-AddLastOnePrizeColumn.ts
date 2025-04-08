import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddLastOnePrizeColumn1709123456795 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add lastOnePrizeId column to gacha table
        await queryRunner.addColumn("gachas", 
            new TableColumn({
                name: "lastOnePrizeId",
                type: "uuid",
                isNullable: true
            })
        );

        // Create foreign key constraint
        await queryRunner.createForeignKey("gachas", 
            new TableForeignKey({
                columnNames: ["lastOnePrizeId"],
                referencedColumnNames: ["id"],
                referencedTableName: "gacha_item",
                onDelete: "SET NULL"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const table = await queryRunner.getTable("gachas");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("lastOnePrizeId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("gachas", foreignKey);
        }

        // Then drop the column
        await queryRunner.dropColumn("gachas", "lastOnePrizeId");
    }
}
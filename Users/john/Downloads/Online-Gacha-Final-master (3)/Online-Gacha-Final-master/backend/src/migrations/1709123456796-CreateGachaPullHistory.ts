import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateGachaPullHistory1709123456796 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "gacha_pull_history",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "userId",
                    type: "uuid"
                },
                {
                    name: "gachaId",
                    type: "uuid"
                },
                {
                    name: "pullCount",
                    type: "int",
                    default: 0
                },
                {
                    name: "pullsSinceLastRare",
                    type: "int",
                    default: 0
                },
                {
                    name: "lastPullAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }));

        await queryRunner.createForeignKey("gacha_pull_history", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("gacha_pull_history", new TableForeignKey({
            columnNames: ["gachaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "gachas",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("gacha_pull_history");
        if (table) {
            const foreignKeys = table.foreignKeys;
            await Promise.all(foreignKeys.map(foreignKey => 
                queryRunner.dropForeignKey("gacha_pull_history", foreignKey)
            ));
        }
        await queryRunner.dropTable("gacha_pull_history");
    }
}
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateFavoritesTable1709123456798 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "favorites",
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
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }));

        // Add foreign key for userId
        await queryRunner.createForeignKey("favorites", new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        // Add foreign key for gachaId
        await queryRunner.createForeignKey("favorites", new TableForeignKey({
            columnNames: ["gachaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "gachas",
            onDelete: "CASCADE"
        }));

        // Add unique constraint to prevent duplicate favorites
        await queryRunner.query(`
            ALTER TABLE "favorites"
            ADD CONSTRAINT "unique_user_gacha_favorite" 
            UNIQUE ("userId", "gachaId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("favorites");
        if (table) {
            const foreignKeys = table.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("favorites", foreignKey);
            }
        }
        await queryRunner.dropTable("favorites");
    }
}
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTypeColumnToFavorites1709123456799 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create the enum type
        await queryRunner.query(`
            CREATE TYPE favorite_type_enum AS ENUM ('like', 'dislike')
        `);

        // Then add the column
        await queryRunner.addColumn("favorites", new TableColumn({
            name: "type",
            type: "favorite_type_enum",
            default: "'like'"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("favorites", "type");
        await queryRunner.query(`DROP TYPE favorite_type_enum`);
    }
}
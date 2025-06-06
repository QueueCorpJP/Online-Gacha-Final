import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

console.log(configService.get('DB_PORT'))

export default new DataSource({
  type: 'postgres',
  // host: configService.get('DB_HOST'),
  // port: configService.get('5432'),
  // username: configService.get('DB_USER'),
  port: parseInt(configService.get('DB_PORT') || '5432', 10),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
});
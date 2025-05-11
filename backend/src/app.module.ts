import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './modules/payments/payment.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GachaModule } from './modules/gacha/gacha.module';
import { AdminModule } from './modules/admin/admin.module';
import { databaseConfig } from './config/database.config';
import { SecurityModule } from './modules/security/security.module';
import { SupportModule } from './modules/support/support.module';
import { CategoryModule } from './modules/category/category.module';
import { InventoryManagementModule } from './modules/inventory/inventory-management.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProfileModule } from './modules/profile/profile.module';
import { InviteModule } from './modules/invite/invite.module';
import { CoinModule } from './modules/coin/coin.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { LineModule } from './modules/line/line.module';
import { PointsModule } from './modules/points/points.module';
import { InquiryModule } from './modules/inquiries/inquiry.module';
import { NewsBlogModule } from './modules/news-blog/news-blog.module';
import { FAQModule } from './modules/faqs/faq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Set this to false to prevent automatic schema updates
      logging: true, // 一時的にログを有効化して問題を特定
      autoLoadEntities: true, // エンティティの自動読み込みを有効化
    }),
    PaymentModule,
    AuthModule,
    UserModule,
    GachaModule,
    AdminModule,
    SecurityModule,
    CategoryModule,
    SupportModule,
    InventoryManagementModule,
    ReportingModule,
    ProfileModule,
    InviteModule,
    CoinModule,
    NotificationModule,
    LineModule,
    PointsModule,
    InquiryModule,
    NewsBlogModule,
    FAQModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}

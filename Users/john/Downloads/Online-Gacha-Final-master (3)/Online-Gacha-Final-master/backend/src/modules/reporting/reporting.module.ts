import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReportService } from './reporting.service';
import { ReportController } from './reporting.controller';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { BlacklistedToken } from '../auth/entities/blacklisted-token.entity';
import { AuthGuard } from '../../common/auth.guard';
import { GachaItem } from '../gacha/entities/gacha-item.entity';
import { InventorySettings } from '../inventory/inventory-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User, BlacklistedToken, GachaItem, InventorySettings]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ReportController],
  providers: [
    ReportService,
    AuthGuard
  ],
  exports: [ReportService]
})
export class ReportingModule {}

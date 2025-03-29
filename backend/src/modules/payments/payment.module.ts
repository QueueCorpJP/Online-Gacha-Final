import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PayPayService } from './paypay.service';
import { Payment } from './entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AuthGuard } from '../../common/auth.guard';
import { CoinModule } from '../coin/coin.module';
import { ReferralModule } from '../referrals/referral.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]),
    UserModule,
    ConfigModule,
    CoinModule,
    ReferralModule,
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
  controllers: [PaymentController],
  providers: [PaymentService, PayPayService, AuthGuard],
  exports: [PaymentService],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { PointsTransaction } from './entities/points-transaction.entity';
import { User } from '../user/entities/user.entity';
import { PaymentModule } from '../payments/payment.module';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsTransaction, User]),
    PaymentModule,
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
  controllers: [PointsController],
  providers: [PointsService, AuthGuard],
  exports: [PointsService],
})
export class PointsModule {}

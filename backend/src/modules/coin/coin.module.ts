import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { User } from '../user/entities/user.entity';
import { CoinService } from './services/coin.service';
import { CoinController } from './controllers/coin.controller';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinTransaction, User]),
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
    ConfigModule,
  ],
  providers: [CoinService, AuthGuard],
  controllers: [CoinController],
  exports: [CoinService, TypeOrmModule]
})
export class CoinModule {}

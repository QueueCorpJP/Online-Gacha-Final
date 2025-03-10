import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CoinTransaction } from '../coin/entities/coin-transaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Payment,
      CoinTransaction,
    ]),
    AuthModule, // This will now provide both AuthGuard and BlacklistedTokenRepository
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

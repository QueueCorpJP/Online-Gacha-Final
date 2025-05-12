import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Prize } from './prize.entity';
import { User } from '../user/entities/user.entity';
import { PrizeService } from './prize.service';
import { PrizeController } from './prize.controller';
import { SecurityModule } from '../security/security.module';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prize, User]),
    SecurityModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [PrizeService, AuthGuard],
  controllers: [PrizeController],
})
export class PrizeModule {}

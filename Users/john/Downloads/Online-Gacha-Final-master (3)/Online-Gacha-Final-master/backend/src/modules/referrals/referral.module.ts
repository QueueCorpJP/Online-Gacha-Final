import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralService } from './referral.service';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [ReferralService],
  exports: [ReferralService], // Export ReferralService so it can be used in other modules
})
export class ReferralModule {}

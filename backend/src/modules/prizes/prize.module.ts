import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prize } from './prize.entity';
import { User } from '../user/entities/user.entity';
import { PrizeService } from './prize.service';
import { PrizeController } from './prize.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prize, User])],
  providers: [PrizeService],
  controllers: [PrizeController],
})
export class PrizeModule {}

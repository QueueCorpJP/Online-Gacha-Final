import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [RankingService],
  controllers: [RankingController],
})
export class RankingModule {}

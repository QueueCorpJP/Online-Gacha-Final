import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { AuthGuard } from '../../common/auth.guard';

@Controller('rankings')
@UseGuards(AuthGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get(':period')
  async getRankings(@Param('period') period: 'daily' | 'weekly' | 'monthly') {
    return this.rankingService.getRankings(period);
  }
}

import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PrizeService } from './prize.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('prizes')
@UseGuards(AuthGuard)
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Get('list')
  async getPrizes(@CurrentUser() user: User) {
    if (!user.id) {
      throw new Error('User ID is required');
    }
    return this.prizeService.getUserPrizes(user.id!);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') prizeId: string, @Body('status') status: string) {
    return this.prizeService.updatePrizeStatus(prizeId, status);
  }

  @Put(':id/convert')
  async convertToCoins(@Param('id') prizeId: string, @CurrentUser() user: User) {
    return this.prizeService.convertPrizeToCoins(prizeId, user);
  }

  @Put(':id/ship')
  async shipPrize(@Param('id') prizeId: string, @CurrentUser() user: User) {
    return this.prizeService.shipPrize(prizeId, user);
  }
}

import { Controller, Get, Post, Body, UseGuards, Put, Query } from '@nestjs/common';
import { CoinService } from '../services/coin.service';
import { AuthGuard } from '../../../common/auth.guard';
import { CurrentUser } from '../../../common/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { Roles } from '../../../common/roles.decorator';
import { RolesGuard } from '../../../common/roles.guard';
import { TransactionType } from '../entities/coin-transaction.entity';

@Controller('coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get('history')
  async getCoinHistory(@CurrentUser() user: User) {
    return this.coinService.getCoinHistory(user.id);
  }

  @Post('purchase')
  async purchaseCoins(
    @CurrentUser() user: User,
    @Body() body: { amount: number; method: TransactionType },
  ) {
    return this.coinService.purchaseCoins(user.id, body.amount, body.method);
  }

  @Put('admin/configure')
  // @Roles('admin')
  @UseGuards(RolesGuard)
  async configureCoinSettings(@Body() body: { minCoinsForShipping: number }) {
    return this.coinService.configureSettings(body.minCoinsForShipping);
  }

  @Get('gacha-stats')
  async getGachaPurchaseStats(@Query('period') period?: 'daily' | 'weekly' | 'monthly') {
    if (typeof period === "undefined")
      period = 'daily';

    return this.coinService.getGachaPurchaseStats(period);
  }

  @UseGuards(AuthGuard)
  @Get('transactions')
  async getAllTransactions(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: TransactionType
  ) {
    return this.coinService.getAllTransactions(
      user.id,
      page || 1,
      limit || 10,
      type
    );
  }
}

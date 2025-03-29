import { Controller, Get, Post, Body, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { PointsService } from './points.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { PurchasePointsDto } from './dto/purchase-points.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Points')
@Controller('points')
@UseGuards(AuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get user points balance' })
  @ApiResponse({ status: 200, description: 'Returns the current points balance' })
  async getBalance(@CurrentUser() user: User) {
    return this.pointsService.getBalance(user.id);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Purchase points' })
  @ApiResponse({ status: 201, description: 'Points purchased successfully' })
  async purchasePoints(
    @CurrentUser() user: User,
    @Body(ValidationPipe) purchaseDto: PurchasePointsDto,
  ) {
    return this.pointsService.purchasePoints(user.id, purchaseDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get points transaction history' })
  @ApiResponse({ status: 200, description: 'Returns the points transaction history' })
  async getTransactions(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.pointsService.getTransactionHistory(user.id, page, limit);
  }
}

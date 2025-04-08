import { Controller, Get, Post, Query, Param, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/current-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getUserInventory(
    @CurrentUser() user: User,
    @Query('filter') filter: string = 'all',
  ) {
    return this.inventoryService.getUserInventory(user.id, filter);
  }

  @Post(':itemId/exchange')
  async exchangeForPoints(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
  ) {
    return this.inventoryService.exchangeForPoints(user.id, itemId);
  }

  @Post(':itemId/ship')
  @ApiOperation({ summary: 'Request shipping for an inventory item' })
  @ApiResponse({ status: 200, description: 'Shipping request successful' })
  @ApiResponse({ status: 404, description: 'Item not found or not available' })
  async requestShipping(
    @Param('itemId') itemId: string,
    @CurrentUser() user: any
  ) {
    return this.inventoryService.createShippingRequest(itemId, user.id);
  }
}

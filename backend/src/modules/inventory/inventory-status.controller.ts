import { Controller, Get, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from 'src/common/auth.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { InventoryStatusService } from './inventory-status.service';

@Controller('inventory/status')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
// @Roles('ADMIN')
export class InventoryStatusController {
  constructor(private readonly inventoryStatusService: InventoryStatusService) {}

  @Get()
  async getInventoryStatus() {
    return this.inventoryStatusService.getInventoryStatus();
  }

  @Put('threshold/:id')
  async updateThreshold(
    @Param('id') id: string,
    @Body('threshold') threshold: number,
  ) {
    return this.inventoryStatusService.updateThreshold(id, threshold);
  }

  @Get('/shipping')  // This will handle /admin/inventory/status
  async getInventoryStatuses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: 'available' | 'shipping' | 'shipped',
    @Query('email') email?: string
  ) {
    return this.inventoryStatusService.getInventoryShippingStatuses(page, limit, status, email);
  }

  @Put(':id')  // This will handle /admin/inventory/status/:id
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'available' | 'exchanged' | 'locked' | 'shipping' | 'shipped',
  ) {
    console.log(id);
    return this.inventoryStatusService.updateStatus(id, status);
  }
}

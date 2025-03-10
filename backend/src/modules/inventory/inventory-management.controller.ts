import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { InventoryManagementService } from './inventory-management.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { AuthGuard } from '../../common/auth.guard';

interface InventorySettings {
  globalThreshold: string;
  notificationMethod: string;
  realTimeUpdates: boolean;
}

@Controller('admin/inventory')
// @UseGuards(AuthGuard, RolesGuard)
export class InventoryManagementController {
  constructor(private readonly inventoryService: InventoryManagementService) {}

  @Get('settings')
  // @Roles('admin')
  async getSettings() {
    return this.inventoryService.getInventorySettings();
  }

  @Put('settings')
  // @Roles('admin')
  async updateSettings(@Body() settings: InventorySettings): Promise<InventorySettings> {
    return this.inventoryService.updateInventorySettings(settings);
  }
}

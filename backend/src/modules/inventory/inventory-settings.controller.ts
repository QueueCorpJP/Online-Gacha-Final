import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { InventorySettingsService } from './inventory-settings.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';

@Controller('inventory/settings')
// @UseGuards(AuthGuard, RolesGuard)
export class InventorySettingsController {
  constructor(private readonly inventorySettingsService: InventorySettingsService) {}

  @Get()
  async getSettings() {
    return this.inventorySettingsService.getSettings();
  }

  @Put()
  async updateSettings(
    @Body() settings: {
      globalThreshold: number;
      notificationMethod: string;
      realTimeUpdates: boolean;
    }
  ) {
    return this.inventorySettingsService.updateSettings(settings);
  }
}
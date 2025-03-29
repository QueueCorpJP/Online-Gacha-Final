import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SecuritySettingsService } from './security-settings.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { SecuritySettingsDto } from './security-settings.dto';

@Controller('admin/security/settings')
@UseGuards(AuthGuard, RolesGuard)
// @Roles('admin')
export class SecuritySettingsController {
  constructor(private readonly securitySettingsService: SecuritySettingsService) {}

  @Get()
  async getSettings() {
    return this.securitySettingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() settings: SecuritySettingsDto) {
    return this.securitySettingsService.updateSettings(settings);
  }
}

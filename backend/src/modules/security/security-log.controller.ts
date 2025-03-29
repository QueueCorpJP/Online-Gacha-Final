import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { SecurityLogService } from './security-log.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/security/logs')
@UseGuards(AuthGuard, RolesGuard)
export class SecurityLogController {
  constructor(private readonly securityLogService: SecurityLogService) {}

  @Get()
  async getSecurityLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.securityLogService.getSecurityLogs(page, limit);
  }
}

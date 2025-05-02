import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './reporting.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/reports')
// @UseGuards(AuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':type')
  async getReportData(@Param('type') type: string) {
    return this.reportService.getReportData(type);
  }

  @Get(':type/export/:format')
  async exportReport(
    @Param('type') type: string,
    @Param('format') format: string,
    @Res() res: Response,
  ) {
    const { data, filename } = await this.reportService.exportReport(type, format);
    
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/pdf');
    return res.send(data);
  }
}




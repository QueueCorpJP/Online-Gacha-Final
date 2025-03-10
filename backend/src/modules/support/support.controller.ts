import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';

@Controller('admin/support')
@UseGuards(AuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('inquiries')
  async getAllInquiries() {
    return this.supportService.getAllInquiries();
  }

  @Post('inquiries')
  async createInquiry(@Body() createInquiryDto: CreateInquiryDto) {
    return this.supportService.createInquiry(createInquiryDto);
  }

  @Put('inquiries/:id/status')
  async updateInquiryStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInquiryStatusDto,
  ) {
    return this.supportService.updateInquiryStatus(id, updateStatusDto);
  }
}
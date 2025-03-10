import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { InquiryStatus } from './inquiry.entity';

@Controller('support/inquiries')
@UseGuards(AuthGuard)
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get()
  async getInquiries() {
    return this.inquiryService.getInquiries();
  }

  @Post()
  async createInquiry(
    @Body() createInquiryDto: {
      subject: string;
      message: string;
      status?: InquiryStatus;
    },
    @CurrentUser() user: User
  ) {
    return this.inquiryService.createInquiry({
      ...createInquiryDto,
      userId: user.id
    });
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.inquiryService.updateInquiryStatus(id, status);
  }
}

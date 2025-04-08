import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FAQService } from './faq.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';

@Controller('faqs')
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Get()
  async getFAQs() {
    return this.faqService.getFAQs();
  }

  @Post()
  async addFAQ(@Body() body: { question: string; answer: string }) {
    return this.faqService.addFAQ(body.question, body.answer);
  }

  @Delete(':id')
  async deleteFAQ(@Param('id') id: string) {
    return this.faqService.deleteFAQ(id);
  }
}

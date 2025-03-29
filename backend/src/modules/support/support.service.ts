import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async getAllInquiries() {
    return this.inquiryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createInquiry(createInquiryDto: CreateInquiryDto) {
    const inquiry = this.inquiryRepository.create(createInquiryDto);
    return this.inquiryRepository.save(inquiry);
  }

  async updateInquiryStatus(id: string, updateStatusDto: UpdateInquiryStatusDto) {
    await this.inquiryRepository.update(id, updateStatusDto);
    return this.inquiryRepository.findOne({ where: { id } });
  }
}
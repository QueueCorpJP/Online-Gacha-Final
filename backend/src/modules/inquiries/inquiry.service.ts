import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from './inquiry.entity';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  async getInquiries(): Promise<Inquiry[]> {
    return this.inquiryRepository.find({ 
      order: { createdAt: 'DESC' },
      relations: ['user'], // Add this to include user data
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });
  }

  async createInquiry(createInquiryDto: {
    userId: string;
    subject: string;
    message: string;
    status?: InquiryStatus;
  }): Promise<Inquiry> {
    const inquiry = this.inquiryRepository.create({
      ...createInquiryDto,
      status: InquiryStatus.PENDING
    });
    return this.inquiryRepository.save(inquiry);
  }

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    try {
      // Convert the incoming status string to enum value
      const validStatus = this.validateStatus(status);
      inquiry.status = validStatus;
      return this.inquiryRepository.save(inquiry);
    } catch (error) {
      throw new BadRequestException(`Invalid status value. Must be one of: ${Object.values(InquiryStatus).join(', ')}`);
    }
  }

  private validateStatus(status: string): InquiryStatus {
    const upperStatus = status.toUpperCase();
    // Check if the status exists in the enum
    if (Object.values(InquiryStatus).includes(upperStatus as InquiryStatus)) {
      return upperStatus as InquiryStatus;
    }
    throw new Error(`Invalid status: ${status}`);
  }
}

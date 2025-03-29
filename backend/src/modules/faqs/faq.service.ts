import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQ } from './faq.entity';

@Injectable()
export class FAQService {
  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
  ) {}

  async getFAQs() {
    return this.faqRepository.find({
      order: { createdAt: 'ASC' }
    });
  }

  async addFAQ(question: string, answer: string) {
    // Get current FAQ count
    const currentFAQs = await this.faqRepository.find({
      order: { createdAt: 'ASC' } // Get oldest first
    });

    // If we already have 4 FAQs, remove the oldest one
    if (currentFAQs.length >= 4) {
      await this.faqRepository.remove(currentFAQs[0]);
    }

    // Create and save the new FAQ
    const faq = this.faqRepository.create({ question, answer });
    return this.faqRepository.save(faq);
  }

  async deleteFAQ(id: string) {
    const result = await this.faqRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('FAQ not found');
    }
    return { success: true };
  }
}

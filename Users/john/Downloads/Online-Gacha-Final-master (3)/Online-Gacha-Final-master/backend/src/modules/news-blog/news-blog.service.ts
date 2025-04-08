import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsBlog, NewsBlogType } from './news-blog.entity';

@Injectable()
export class NewsBlogService {
  constructor(
    @InjectRepository(NewsBlog)
    private readonly newsBlogRepository: Repository<NewsBlog>,
  ) {}

  async getAllNewsAndBlogs() {
    return this.newsBlogRepository.find({ 
      order: { createdAt: 'DESC' } 
    });
  }

  async createNewsOrBlog(data: Partial<NewsBlog>): Promise<NewsBlog> {
    // If image URL is provided and doesn't start with http, prepend the uploads path
    if (data.image && !data.image.startsWith('http')) {
      data.image = `/uploads/news-blog/${data.image}`;
    }
    
    // Ensure type is valid
    if (data.type && !Object.values(NewsBlogType).includes(data.type)) {
      data.type = NewsBlogType.NEWS; // Default to NEWS if invalid type
    }

    const newsBlog = this.newsBlogRepository.create(data);
    return this.newsBlogRepository.save(newsBlog);
  }

  async updateNewsOrBlog(id: string, data: Partial<NewsBlog>): Promise<NewsBlog> {
    const newsBlog = await this.newsBlogRepository.findOne({ where: { id } });
    if (!newsBlog) {
      throw new NotFoundException('News or Blog not found');
    }

    // If image URL is provided and doesn't start with http, prepend the uploads path
    if (data.image && !data.image.startsWith('http')) {
      data.image = `/uploads/news-blog/${data.image}`;
    }

    // Ensure type is valid
    if (data.type && !Object.values(NewsBlogType).includes(data.type)) {
      data.type = NewsBlogType.NEWS; // Default to NEWS if invalid type
    }

    Object.assign(newsBlog, data);
    return this.newsBlogRepository.save(newsBlog);
  }

  async deleteNewsOrBlog(id: string) {
    const result = await this.newsBlogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('News or Blog not found');
    }
    return { message: 'Deleted successfully' };
  }

  async getNewsByType(type: NewsBlogType) {
    return this.newsBlogRepository.find({
      where: { type },
      order: { createdAt: 'DESC' }
    });
  }

  async getFeaturedNews() {
    return this.newsBlogRepository.find({
      where: { isFeatured: true },
      order: { createdAt: 'DESC' }
    });
  }

  async getNewsOrBlogById(id: string): Promise<NewsBlog> {
    const newsBlog = await this.newsBlogRepository.findOne({ 
      where: { id } 
    });
    
    if (!newsBlog) {
      throw new NotFoundException('News or Blog not found');
    }
    
    return newsBlog;
  }
}

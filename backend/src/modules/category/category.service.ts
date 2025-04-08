import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getCategories() {
    return this.categoryRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async createCategory(name: string) {
    const lastCategory = await this.categoryRepository.findOne({
      where: {name},
      order: { order: 'DESC' },
    });
    const order = lastCategory ? lastCategory.order + 1 : 0;

    const category = this.categoryRepository.create({
      name,
      order,
    });
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    try {
      await this.categoryRepository.remove(category);
      return { success: true };
    } catch (error) {
      if (error.code === '23503') { // Foreign key constraint violation
        throw new BadRequestException(
          'Cannot delete this category because it is still being used by one or more gachas. ' +
          'Please reassign those gachas to a different category first.'
        );
      }
      throw error; // Re-throw other errors
    }
  }

  async updateCategoryOrder(categories: { id: string; name: string }[]) {
    const updates = categories.map((category, index) => {
      return this.categoryRepository.update(category.id, { order: index });
    });
    await Promise.all(updates);
    return this.getCategories();
  }
}

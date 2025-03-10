import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../../common/auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UserRole } from '../../common/enums/user-roles.enum';

@Controller('categories')
// @UseGuards(AuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Post()
  async createCategory(@Body() body: { name: string }) {
    return this.categoryService.createCategory(body.name);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }

  @Put('order')
  async updateCategoryOrder(@Body() body: { categories: { id: string; name: string }[] }) {
    return this.categoryService.updateCategoryOrder(body.categories);
  }
}

import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, NotFoundException, UseGuards } from '@nestjs/common';
import { NewsBlogService } from './news-blog.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('news-blog')
export class NewsBlogController {
  constructor(private readonly newsBlogService: NewsBlogService) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const post = await this.newsBlogService.getNewsOrBlogById(id);
    if (!post) {
      throw new NotFoundException('News or Blog not found');
    }
    return post;
  }

  @Post('uploads')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/news-blog',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        const ext = extname(file.originalname).toLowerCase();
        return cb(null, `${randomName}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return { url: `/uploads/news-blog/${file.filename}` };
  }

  @Get('featured')
  async getFeatured() {
    return this.newsBlogService.getFeaturedNews();
  }

  @Get()
  async getAll() {
    return this.newsBlogService.getAllNewsAndBlogs();
  }

  @Post()
  // @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  async create(@Body() body: { title: string; content: string; image?: string; isFeatured?: boolean }) {
    return this.newsBlogService.createNewsOrBlog(body);
  }

  @Put(':id')
  // @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; image?: string; isFeatured?: boolean },
  ) {
    return this.newsBlogService.updateNewsOrBlog(id, body);
  }

  @Delete(':id')
  // @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.newsBlogService.deleteNewsOrBlog(id);
  }
}

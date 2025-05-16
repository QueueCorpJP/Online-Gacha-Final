import { Controller, Get, Put, Body, UseGuards, Post, UseInterceptors, UploadedFile, Delete, BadRequestException, Logger } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  async getProfile(@CurrentUser() user: User) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, updateProfileDto);
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`プロフィール画像アップロード試行: ユーザーID=${user.id}, ロール=${user.roles}`);
    
    if (!file) {
      this.logger.error('ファイルがアップロードされていません');
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      this.logger.error(`無効なファイル形式: ${file.mimetype}`);
      throw new BadRequestException('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.logger.error(`ファイルサイズ超過: ${file.size} bytes`);
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    try {
      const imageUrl = await this.profileService.uploadProfileImage(
        user.id,
        file.buffer,
        file.mimetype,
      );
      
      this.logger.log(`プロフィール画像アップロード成功: ${imageUrl}`);
      return { url: imageUrl };
    } catch (error) {
      this.logger.error(`プロフィール画像アップロード失敗: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete profile image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteProfileImage(@CurrentUser() user: User) {
    await this.profileService.deleteProfileImage(user.id);
    return { message: 'Profile image deleted successfully' };
  }
}
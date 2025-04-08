import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
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
}
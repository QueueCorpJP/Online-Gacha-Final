import { 
  Controller, 
  Get, 
  Put, 
  Patch,
  Delete,
  Query, 
  Param, 
  Body, 
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { UserService } from './user.service';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserStatus } from './entities/user.entity';

@ApiTags('Admin Users')
@Controller('admin/users')
// @UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.userService.findAll(page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, description: 'Returns matching users' })
  async searchUsers(@Query('q') query: string) {
    return this.userService.searchUsers(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Returns user statistics' })
  async getUserStats() {
    return this.userService.getUserStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  async getUserDetails(@Param('id') userId: string) {
    return this.userService.getUserDetails(userId);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({ status: 200, description: 'Returns user transactions' })
  async getUserTransactions(@Param('id') userId: string) {
    return this.userService.getUserTransactions(userId);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get user payments' })
  @ApiResponse({ status: 200, description: 'Returns user payments' })
  async getUserPayments(@Param('id') userId: string) {
    return this.userService.getUserPayments(userId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UserStatus
  ) {
    console.log(status);
    return this.userService.updateStatus(userId, status);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: 'Update user roles' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully' })
  async updateUserRoles(
    @Param('id') userId: string,
    @Body('roles') roles: UserRole[]
  ) {
    return this.userService.updateUserRoles(userId, roles);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete account with active subscriptions or pending transactions' })
  async deleteUserAccount(@Param('id') userId: string) {
    const canDelete = await this.userService.canDeleteAccount(userId);
    if (!canDelete.allowed) {
      throw new ForbiddenException(canDelete.reason);
    }
    await this.userService.deleteAccount(userId);
    return { message: 'Account deleted successfully' };
  }
}

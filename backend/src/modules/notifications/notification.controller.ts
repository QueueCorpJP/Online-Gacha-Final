import { Controller, Post, Get, Body, UseGuards, Param, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user')
  async getUserNotifications(@CurrentUser() user: User) {
    return this.notificationService.getUserNotifications(user.id);
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser() user: User
  ) {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  async sendNotification(
    @Body() notification: { type: string; title: string; content: string }
  ) {
    return this.notificationService.sendNotification(notification);
  }
}

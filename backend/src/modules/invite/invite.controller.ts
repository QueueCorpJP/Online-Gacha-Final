import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { InviteService } from './invite.service';
import { User } from '../user/entities/user.entity';

@Controller('invite')
@UseGuards(AuthGuard)
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('submit')
  async submitInviteCode(
    @CurrentUser() user: User,
    @Body('code') code: string,
  ) {
    return this.inviteService.submitInviteCode(user.id, code);
  }

  @Post('generate')
  async generateInviteCode(@CurrentUser() user: User) {
    return this.inviteService.generateInviteCode(user.id);
  }

  @Get('stats')
  async getInviteStats(@CurrentUser() user: User) {
    return this.inviteService.getInviteStats(user.id);
  }
}

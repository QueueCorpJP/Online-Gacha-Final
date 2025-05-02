import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('referrals')
@UseGuards(AuthGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  async getReferralCode(@CurrentUser() user: User) {
    if (!user.id) {
      throw new Error('User ID is required');
    }
    return { referralCode: await this.referralService.generateReferralCode(user.id || "") };
  }

  @Post('register')
  async registerWithReferral(
    @Body() body: { email: string; password: string; name: string; referralCode?: string },
  ) {
    return this.referralService.registerWithReferral(body.email, body.password, body.name, body.referralCode);
  }

  @Post('bonus')
  async applyReferralBonus(
    @Body() body: { purchasingUserId: string; purchaseAmount: number },
  ) {
    await this.referralService.applyReferralBonus(body.purchasingUserId, body.purchaseAmount);
    return { message: 'Referral bonus applied successfully' };
  }
}

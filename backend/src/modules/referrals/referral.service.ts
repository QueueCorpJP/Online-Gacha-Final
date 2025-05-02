import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.referralCode) {
      user.referralCode = `${userId.substring(0, 8)}-${Math.random().toString(36).substr(2, 5)}`;
      await this.userRepository.save(user);
    }
    return user.referralCode;
  }

  async registerWithReferral(email: string, password: string, name: string, referralCode?: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const referredBy = referralCode
      ? (await this.userRepository.findOne({ where: { referralCode } }))?.id
      : null;

    const user = this.userRepository.create({
      email,
      password,
      name,
      referredBy,
      referralCode: undefined,
      coinBalance: 0,
    } as DeepPartial<User>);
    return this.userRepository.save(user);
  }

  async applyReferralBonus(purchasingUserId: string, purchaseAmount: number) {
    const purchasingUser = await this.userRepository.findOne({ where: { id: purchasingUserId } });
    if (!purchasingUser || !('referredBy' in purchasingUser) || !purchasingUser.referredBy) return;

    const referrer = await this.userRepository.findOne({ where: { id: purchasingUser.referredBy } });
    if (!referrer) return;

    const bonus = Math.floor(purchaseAmount * 0.01); // 1% of the purchase amount
    referrer.coinBalance += bonus;
    await this.userRepository.save(referrer);
  }
}

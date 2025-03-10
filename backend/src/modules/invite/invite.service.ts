import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { InviteCode } from './entities/invite-code.entity';
import { User } from '../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(InviteCode)
    private inviteCodeRepository: Repository<InviteCode>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitInviteCode(userId: string, code: string) {
    const inviteCode = await this.inviteCodeRepository.findOne({
      where: { code, isUsed: false },
    });

    if (!inviteCode) {
      throw new NotFoundException('Invalid or expired invite code');
    }

    // Get the inviter (user who created the code)
    const inviter = await this.userRepository.findOne({
      where: { id: inviteCode.createdById },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    // Get the user being invited
    const invitedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!invitedUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user has already been invited
    if (invitedUser.referredBy) {
      throw new BadRequestException('User has already been invited');
    }

    // Update the invited user
    invitedUser.referredBy = inviter.id;
    await this.userRepository.save(invitedUser);

    // Mark invite code as used
    inviteCode.isUsed = true;
    inviteCode.usedById = userId;
    inviteCode.usedAt = new Date();
    await this.inviteCodeRepository.save(inviteCode);

    // Get the total number of users invited by the inviter
    const invitedUsersCount = await this.userRepository.count({
      where: { referredBy: inviter.id },
    });

    return { 
      message: 'Invite code successfully redeemed',
      invitedUsersCount
    };
  }

  async generateInviteCode(userId: string) {
    // First check if user has an unused and non-expired invite code
    const existingCode = await this.inviteCodeRepository.findOne({
      where: {
        createdById: userId,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingCode) {
      return { code: existingCode.code };
    }

    // If no valid code exists, generate a new one
    const code = uuidv4().substring(0, 8);
    const inviteCode = this.inviteCodeRepository.create({
      code,
      createdById: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.inviteCodeRepository.save(inviteCode);

    return { code };
  }

  async getInviteStats(userId: string) {
    const [totalInvites, pendingInvites] = await Promise.all([
      // Total users who were referred by this user
      this.userRepository.count({
        where: { referredBy: userId },
      }),
      // Pending invites from invite codes
      this.inviteCodeRepository.count({
        where: {
          createdById: userId,
          isUsed: false,
          expiresAt: MoreThan(new Date()),
        },
      }),
    ]);

    return {
      totalInvites,
      pendingInvites,
    };
  }
}

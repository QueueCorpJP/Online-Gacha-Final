import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prize } from './prize.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PrizeService {
  constructor(
    @InjectRepository(Prize)
    private readonly prizeRepository: Repository<Prize>,
  ) {}

  async getUserPrizes(userId: string): Promise<Prize[]> {
    return this.prizeRepository.find({ where: { user: { id: userId } } });
  }

  async updatePrizeStatus(prizeId: string, status: string): Promise<Prize> {
    const prize = await this.prizeRepository.findOne({ where: { id: prizeId } });
    if (!prize) {
      throw new NotFoundException('Prize not found');
    }
    prize.status = status;
    return this.prizeRepository.save(prize);
  }

  async convertPrizeToCoins(prizeId: string, user: User): Promise<{ message: string }> {
    const prize = await this.prizeRepository.findOne({ where: { id: prizeId, user: { id: user.id } } });
    if (!prize || prize.isConvertedToCoins) {
      throw new BadRequestException('Invalid prize or already converted');
    }
    prize.isConvertedToCoins = true;
    await this.prizeRepository.save(prize);

    user.coinBalance += 100; // Example: add 100 coins, adjust per requirements
    return { message: 'Prize converted to coins successfully' };
  }

  async shipPrize(prizeId: string, user: User): Promise<{ message: string }> {
    const prize = await this.prizeRepository.findOne({ where: { id: prizeId, user: { id: user.id } } });
    if (!prize) {
      throw new BadRequestException('Prize not found');
    }
    prize.status = 'Shipped';
    await this.prizeRepository.save(prize);
    return { message: 'Prize shipping status updated successfully' };
  }
}

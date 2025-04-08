import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction } from '../entities/coin-transaction.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class CoinPurchaseService {
  constructor(
    @InjectRepository(CoinTransaction)
    private readonly coinTransactionRepository: Repository<CoinTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async purchaseCoins(userId: string, amount: number, method: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.coinBalance += amount;
    await this.userRepository.save(user);

    const transaction = this.coinTransactionRepository.create({
      user,
      type: 'purchase',
      amount,
    });
    await this.coinTransactionRepository.save(transaction);

    return { message: 'Purchase successful', balance: user.coinBalance };
  }
}

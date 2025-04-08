import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction } from '../entities/coin-transaction.entity';

@Injectable()
export class CoinTransactionService {
  constructor(
    @InjectRepository(CoinTransaction)
    private readonly coinTransactionRepository: Repository<CoinTransaction>,
  ) {}

  async getCoinHistory(userId: string) {
    return this.coinTransactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction, TransactionType } from '../entities/coin-transaction.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class CoinService {
  private minCoinsForShipping = 0;

  constructor(
    @InjectRepository(CoinTransaction)
    private readonly coinTransactionRepository: Repository<CoinTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getCoinHistory(userId: string) {
    return this.coinTransactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async purchaseCoins(userId: string, amount: number, method: TransactionType, description?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // user.coinBalance += amount;
    // await this.userRepository.save(user);

    const transaction = this.coinTransactionRepository.create({
      user,
      type: method,
      amount,
      metadata: description
    });
    await this.coinTransactionRepository.save(transaction);

    return { message: 'Purchase successful', balance: user.coinBalance };
  }

  async removeCoins(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.coinBalance < amount) {
      throw new BadRequestException('Insufficient coin balance');
    }

    user.coinBalance -= amount;
    await this.userRepository.save(user);

    const transaction = this.coinTransactionRepository.create({
      user,
      type: 'usage',  // Changed from 'refund' to 'usage' as it's a valid TransactionType
      amount: -amount,
    });
    await this.coinTransactionRepository.save(transaction);

    return { message: 'Coins removed successfully', balance: user.coinBalance };
  }

  configureSettings(minCoins: number) {
    if (minCoins < 0) {
      throw new BadRequestException('Minimum coins must be zero or greater');
    }

    this.minCoinsForShipping = minCoins;
    return { message: 'Configuration updated', minCoinsForShipping: this.minCoinsForShipping };
  }

  async getGachaPurchaseStats(period?: 'daily' | 'weekly' | 'monthly') {
    let dateFilter: { createdAt?: { gte: Date } } = {};

    
    
    if (period) {
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'monthly':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
      
      dateFilter = {
        createdAt: {
          gte: startDate
        }
      };
    }

    const stats = await this.coinTransactionRepository
      .createQueryBuilder('transaction')
      .select([
        'SUM(ABS(transaction.amount)) as totalAmount',
        'COUNT(transaction.id) as totalTransactions',
        'AVG(ABS(transaction.amount)) as averageAmount',
        'MAX(ABS(transaction.amount)) as maxAmount'
      ])
      .where('transaction.type = :type', { type: 'usage' })
      .andWhere(period ? 'transaction.createdAt >= :startDate' : '1=1', 
        period && 'createdAt' in dateFilter ? { startDate: (dateFilter as { createdAt: { gte: Date } }).createdAt.gte } : {})
      .getRawOne();

    const recentTransactions = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as userId',
        'user.username as username',
        'user.profileUrl as profileUrl',
        'COALESCE(SUM(ABS(transaction.amount)), 0) as amount'
      ])
      .leftJoin(
        'coin_transactions',
        'transaction',
        'transaction.userId = user.id AND transaction.type = :type' + 
        (period ? ' AND transaction.createdAt >= :startDate' : ''),
        period ? { 
          type: 'usage', 
          startDate: (dateFilter as { createdAt: { gte: Date } }).createdAt.gte 
        } : { type: 'usage' }
      )
      .groupBy('user.id, user.username, user.profileUrl')
      .orderBy('COALESCE(SUM(ABS(transaction.amount)), 0)', 'DESC')
      .take(5)
      .getRawMany();

    const formattedTransactions = recentTransactions.map(t => ({
      id: t.userId,
      amount: Number(t.amount),
      user: {
        id: t.userId,
        username: t.username,
        profileUrl: t.profileUrl
      }
    }));

    return {
      stats,
      recentTransactions: formattedTransactions
    };
  }

  async getAllTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    type?: TransactionType
  ) {
    console.log(userId);
    const queryBuilder = this.coinTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .where('user.id = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Get current user balance
    const user = await this.userRepository.findOne({ where: { id: userId } });
    let currentBalance = user.coinBalance;

    // Calculate balance for each transaction
    const sortedTransactions = [...transactions].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    const balanceMap = new Map<string, number>();
    
    for (const transaction of sortedTransactions) {
      balanceMap.set(transaction.id, currentBalance);
      
      // Adjust balance based on transaction type
      if (transaction.type === 'usage') {
        currentBalance += Math.abs(transaction.amount); // Add back the spent amount
      } else {
        currentBalance -= Math.abs(transaction.amount); // Subtract the received amount
      }
    }

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.type === 'usage' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
      description: transaction.description || null,
      paymentMethod: transaction.paymentMethod || null,
      status: transaction.status,
      metadata: transaction.metadata || null,
      createdAt: transaction.createdAt,
      balance: balanceMap.get(transaction.id)
    }));

    console.log(formattedTransactions);

    return {
      transactions: formattedTransactions,
      
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
      
    };
  }
}

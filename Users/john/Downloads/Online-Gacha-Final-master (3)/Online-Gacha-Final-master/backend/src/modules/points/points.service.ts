import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PointsTransaction } from './entities/points-transaction.entity';
import { User } from '../user/entities/user.entity';
import { PurchasePointsDto } from './dto/purchase-points.dto';
import { PaymentService } from '../payments/payment.service';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointsTransaction)
    private pointsTransactionRepository: Repository<PointsTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paymentService: PaymentService,
  ) {}

  async getBalance(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      balance: user.pointsBalance,
      lastUpdated: user.pointsLastUpdated,
    };
  }

  async purchasePoints(userId: string, purchaseDto: PurchasePointsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Process payment
    const paymentAmount = this.calculatePaymentAmount(purchaseDto.amount);
    const paymentIntent = await this.paymentService.createPaymentIntent(
      userId,
      paymentAmount,
      purchaseDto.amount // assuming this represents the coins/points to be credited
    );

    // Create transaction record
    const transaction = this.pointsTransactionRepository.create({
      userId,
      amount: purchaseDto.amount,
      type: 'PURCHASE',
      cost: paymentAmount,
      status: 'COMPLETED',
    });
    await this.pointsTransactionRepository.save(transaction);

    // Update user balance
    user.pointsBalance += purchaseDto.amount;
    user.pointsLastUpdated = new Date();
    await this.userRepository.save(user);

    return {
      newBalance: user.pointsBalance,
      purchase: {
        id: transaction.id,
        amount: transaction.amount,
        cost: transaction.cost,
        timestamp: transaction.createdAt,
      },
    };
  }

  async getTransactionHistory(userId: string, page: number = 1, limit: number = 10) {
    const [transactions, total] = await this.pointsTransactionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const balance = await this.calculateBalanceAtTransaction(userId, transaction);
        
        let points: number;
        switch (transaction.type) {
          case 'PURCHASE':
          case 'BONUS':
            points = transaction.amount;
            break;
          case 'USAGE':
            points = -transaction.amount;
            break;
          default:
            points = 0;
        }

        return {
          id: transaction.id,
          date: transaction.createdAt,
          description: transaction.type.toLowerCase(),
          points,
          balance,
          // metadata: transaction.metadata || null,
        };
      })
    );

    return {
      transactions: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async calculateBalanceAtTransaction(userId: string, transaction: PointsTransaction) {
    const laterTransactions = await this.pointsTransactionRepository.find({
      where: {
        userId,
        createdAt: MoreThan(transaction.createdAt),
      },
    });

    const currentBalance = await this.getBalance(userId);
    let balanceAtTransaction = currentBalance.balance;

    for (const tx of laterTransactions) {
      balanceAtTransaction -= tx.type === 'PURCHASE' ? tx.amount : -tx.amount;
    }

    return balanceAtTransaction;
  }

  private calculatePaymentAmount(points: number): number {
    // Implement your points to currency conversion logic here
    // For example: 100 points = $1
    return points / 100;
  }
}

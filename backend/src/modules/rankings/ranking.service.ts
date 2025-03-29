import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gacha } from '../gacha/entities/gacha.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getRankings(period: 'daily' | 'weekly' | 'monthly') {
    // const dateFrom = this.getDateFromPeriod(period);

    // const rankings = await this.gachaTransactionRepository
    //   .createQueryBuilder('transaction')
    //   .select('transaction.userId', 'userId')
    //   .addSelect('SUM(transaction.amount)', 'totalSpent')
    //   .where('transaction.date >= :dateFrom', { dateFrom })
    //   .groupBy('transaction.userId')
    //   .orderBy('SUM(transaction.amount)', 'DESC')
    //   .getRawMany();

    // Enrich rankings with user information
    const enrichedRankings: User[] = [];
    // for (const rank of rankings) {
    //   const user = await this.userRepository.findOne({ where: { id: rank.userId } });
    //   if (user) {
    //     enrichedRankings.push({
    //       rank: enrichedRankings.length + 1,
    //       userId: user.id,
    //       name: `${user.firstName} ${user.lastName}`,
    //       totalSpent: rank.totalSpent,
    //     });
    //   }
    // }

    return enrichedRankings;
  }

  private getDateFromPeriod(period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    if (period === 'daily') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      const weekStart = now.getDate() - now.getDay();
      return new Date(now.getFullYear(), now.getMonth(), weekStart);
    } else if (period === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    throw new Error('Invalid period');
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CoinTransaction } from '../coin/entities/coin-transaction.entity';
import { UserRole } from '../../common/enums/user-roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
  ) {}

  async searchUsers(query: string): Promise<Partial<User>[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.status',
        'user.coinBalance',
        'user.createdAt',
        'user.roles',
        'user.firstName',
        'user.lastName',
        'user.isEmailVerified',
      ])
      .where('LOWER(user.username) LIKE LOWER(:query) OR LOWER(user.email) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('user.createdAt', 'DESC')
      .take(20)
      .getMany();

    return users.map(user => {
      const { password, ...userData } = user;
      return userData;
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'username',
        'email',
        'status',
        'coinBalance',
        'createdAt',
        'roles',
        'firstName',
        'lastName',
        'isEmailVerified',
      ],
    });

    return {
      users: users.map(user => {
        const { password, ...userData } = user;
        return userData;
      }),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status value');
    }

    user.status = status;
    await this.userRepository.save(user);

    const { password, ...userData } = user;
    return userData as User;
  }

  async getUserDetails(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['coinTransactions', 'payments'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userData } = user;
    return userData as User;
  }

  async getUserTransactions(userId: string): Promise<CoinTransaction[]> {
    const transactions = await this.coinTransactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    return transactions;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    return payments;
  }

  async getUserStats() {
    const [
      total,
      active,
      suspended,
      banned
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.SUSPENDED } }),
      this.userRepository.count({ where: { status: UserStatus.BANNED } })
    ]);

    return {
      total,
      active,
      suspended,
      banned
    };
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!roles.length) {
      throw new BadRequestException('User must have at least one role');
    }

    // Validate roles
    const validRoles = Object.values(UserRole);
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestException(`Invalid roles: ${invalidRoles.join(', ')}`);
    }

    user.roles = roles;
    await this.userRepository.save(user);

    const { password, ...userData } = user;
    return userData as User;
  }

  async canDeleteAccount(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['coinTransactions', 'payments'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for pending transactions
    const pendingTransactions = user.coinTransactions?.some(
      tx => tx.status === 'pending'
    );
    if (pendingTransactions) {
      return {
        allowed: false,
        reason: 'User has pending transactions',
      };
    }

    // Check for active subscriptions or other conditions
    const hasActiveSubscription = await this.paymentRepository.findOne({
      where: {
        user: { id: userId },
        status: 'active',
      },
    });

    if (hasActiveSubscription) {
      return {
        allowed: false,
        reason: 'User has active subscriptions',
      };
    }

    return { allowed: true };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }
}

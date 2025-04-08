import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AccountDeletionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async deleteAccount(userId: string) {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new Error('Account not found');
    }
    return { message: 'Account deleted successfully' };
  }
}

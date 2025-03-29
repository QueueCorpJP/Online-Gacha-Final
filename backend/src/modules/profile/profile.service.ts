import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.postalCode,
      address: user.address,
      phone: user.phone,
      coinBalance: user.coinBalance,
      roles: user.roles
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the user object
    Object.assign(user, {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      postalCode: updateProfileDto.postalCode,
      address: updateProfileDto.address,
      phone: updateProfileDto.phone,
    });

    await this.userRepository.save(user);

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.postalCode,
      address: user.address,
      phone: user.phone,
    };
  }
}

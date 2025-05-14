import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
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
      roles: user.roles,
      profileUrl: user.profileUrl
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
      profileUrl: user.profileUrl
    };
  }

  async uploadProfileImage(userId: string, file: Buffer, contentType: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 既存の画像があれば削除
    if (user.profileUrl) {
      try {
        await this.s3Service.deleteImage(user.profileUrl);
      } catch (error) {
        console.error('Failed to delete previous profile image:', error);
        // 削除に失敗しても続行
      }
    }

    // 新しい画像をアップロード
    const imageUrl = await this.s3Service.uploadProfileImage(file, contentType);
    
    // ユーザー情報を更新
    user.profileUrl = imageUrl;
    await this.userRepository.save(user);

    return imageUrl;
  }

  async deleteProfileImage(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profileUrl) {
      return; // 画像がない場合は何もしない
    }

    // S3から画像を削除
    await this.s3Service.deleteImage(user.profileUrl);
    
    // ユーザー情報を更新
    user.profileUrl = null;
    await this.userRepository.save(user);
  }
}

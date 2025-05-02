import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AccountDeletionService } from './account-deletion.service';
import { AccountDeletionController } from './account-deletion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AccountDeletionService],
  controllers: [AccountDeletionController],
})
export class AccountDeletionModule {}

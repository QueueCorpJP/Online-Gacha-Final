import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { InviteCode } from './entities/invite-code.entity';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteCode, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [InviteController],
  providers: [InviteService, AuthGuard],
  exports: [InviteService]
})
export class InviteModule {}

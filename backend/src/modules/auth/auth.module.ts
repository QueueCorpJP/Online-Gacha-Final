import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '../../common/auth.guard';
import { MailModule } from '../mail/mail.module';
import { OTP } from './entities/otp.entity';
import { SecurityModule } from '../security/security.module';
import { LineSettings } from '../line/entities/line-settings.entity';
import { InviteCode } from '../invite/entities/invite-code.entity';

@Module({
  imports: [
    MailModule,
    SecurityModule,
    TypeOrmModule.forFeature([BlacklistedToken, User, OTP, LineSettings, InviteCode]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],  
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [
    AuthService,
    AuthGuard,
    JwtModule,
    TypeOrmModule.forFeature([BlacklistedToken]),
  ],
})
export class AuthModule {}


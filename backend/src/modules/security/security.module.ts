import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlacklistedToken } from '../auth/entities/blacklisted-token.entity';
import { SecurityLog } from './security-log.entity';
import { AuthGuard } from '../../common/auth.guard';
import { SecurityLogController } from './security-log.controller';
import { SecuritySettingsController } from './security-settings.controller';
import { SecurityLogService } from './security-log.service';
import { SecuritySettings } from './security-settings.entity';
import { SecuritySettingsService } from './security-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlacklistedToken, SecurityLog, SecuritySettings]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SecurityLogController, SecuritySettingsController],
  providers: [
    AuthGuard,
    SecurityLogService,
    SecuritySettingsService
  ],
  exports: [AuthGuard, JwtModule, SecurityLogService],
})
export class SecurityModule {}

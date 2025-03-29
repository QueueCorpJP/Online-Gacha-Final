import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from './notification.entity';
import { User } from '../user/entities/user.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AuthGuard } from '../../common/auth.guard';
import { LineModule } from '../line/line.module';
import { LineSettings } from '../line/entities/line-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, LineSettings]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    LineModule,
  ],
  providers: [NotificationService, AuthGuard],
  controllers: [NotificationController],
})
export class NotificationModule {}

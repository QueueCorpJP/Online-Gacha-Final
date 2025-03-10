import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Inquiry } from './inquiry.entity';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inquiry]),
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
    ConfigModule,
  ],
  providers: [InquiryService, AuthGuard],
  controllers: [InquiryController],
})
export class InquiryModule {}

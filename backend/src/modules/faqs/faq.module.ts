import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FAQ } from './faq.entity';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([FAQ]),
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
  ],
  providers: [FAQService, AuthGuard],
  controllers: [FAQController],
})
export class FAQModule {}

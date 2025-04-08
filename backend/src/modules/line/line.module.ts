import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LineController } from './line.controller';
import { LineService } from './line.service';
import { LineSettings } from './entities/line-settings.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LineMiddleware } from 'src/common/line.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([LineSettings]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
  
})
export class LineModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LineMiddleware).forRoutes('user/line/callback');
  }
}

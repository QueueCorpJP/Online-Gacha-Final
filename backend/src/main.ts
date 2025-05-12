import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // 詳細で柔軟なCORS設定
  app.enableCors({
    origin: (origin, callback) => {
      const whitelist = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://oripa-shijon.com',
        'https://www.oripa-shijon.com',
        'https://api.oripa-shijon.com',
        /^https?:\/\/localhost(:\d+)?$/ // ローカル環境での開発用
      ];

      // originが未定義（同一オリジン）または許可リストに含まれている場合
      if (!origin || whitelist.some(
        domain => 
          (typeof domain === 'string' && domain === origin) || 
          (domain instanceof RegExp && domain.test(origin))
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Origin', 
      'X-Requested-With', 
      'Content-Length'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // より安全なボディパーサー設定
  app.use(bodyParser.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf.toString();
    },
    limit: '50mb'
  }));

  app.use(bodyParser.urlencoded({ 
    extended: true,
    limit: '50mb'
  }));

  // LINE Webhook middleware
  const lineConfig = {
    channelSecret: process.env.LINE_CLIENT_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
  };

  app.use('/line/webhook', lineMiddleware(lineConfig));

  // オプションのSwagger設定（コメントアウト解除可）
  // const config = new DocumentBuilder()
  //   .setTitle('Gacha API')
  //   .setDescription('API documentation for Online Trading Card Gacha Website')
  //   .setVersion('1.0')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document);

  // 環境変数からポートを取得、デフォルトは3001
  const port = process.env.PORT || 3001;
  
  await app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap().catch(error => {
  console.error('Failed to start the application', error);
});
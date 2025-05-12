import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // 1. NestFactory.create() のオプションで CORS を一発設定
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['https://oripa-shijon.com', 'https://www.oripa-shijon.com'],
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Content-Length'
      ],
      credentials: true,
      maxAge: 86400,
    },
  });

  // 2. グローバルプレフィックスは外して、ルート直下のパス (/categories など) に合わせる
  // app.setGlobalPrefix('api'); // 削除 or コメントアウト

  // 3. ボディパーサー設定
  app.use(bodyParser.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf.toString();
    },
    limit: '50mb',
  }));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
  }));

  // 4. LINE Webhook 用ミドルウェア
  const lineConfig = {
    channelSecret: process.env.LINE_CLIENT_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  };
  app.use('/line/webhook', lineMiddleware(lineConfig));

  // 5. サーバ起動
  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap().catch(error => {
  console.error('Failed to start application', error);
});

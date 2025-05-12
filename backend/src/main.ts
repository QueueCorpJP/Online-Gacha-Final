import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';
import * as cors from 'cors';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // OPTIONSリクエスト用のミドルウェア
  app.use((req: Request, res: Response, next: NextFunction) => {
    // OPTIONSリクエストの場合は即座に200を返す
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', 'https://oripa-shijon.com');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Content-Length');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      return res.status(200).end();
    }
    return next();
  });

  // シンプルなCORS設定 - フロントエンドからAPIドメインへのアクセスを許可
  app.use(cors({
    origin: ['https://oripa-shijon.com', 'https://www.oripa-shijon.com'],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Content-Length'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 200
  }));

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
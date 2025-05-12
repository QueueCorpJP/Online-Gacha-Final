import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // 1. Nest.js の組み込み CORS を有効化
  app.enableCors({
    origin: ['https://oripa-shijon.com', 'https://www.oripa-shijon.com'],
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','Origin','X-Requested-With','Content-Length'],
    credentials: true,
    maxAge: 86400,
  });

  // 2. 独自ミドルウェアを「全リクエスト」に適用する
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 常に CORS ヘッダーを付与
    res.header('Access-Control-Allow-Origin', 'https://oripa-shijon.com');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Content-Length');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');

    // プリフライトだけ 204 で返して終了
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
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
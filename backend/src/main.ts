import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // ⚠️ CORS設定を削除
  const app = await NestFactory.create(AppModule);

  // app.setGlobalPrefix('api'); ←使わない場合はそのままコメントでOK

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

  const lineConfig = {
    channelSecret: process.env.LINE_CLIENT_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  };
  app.use('/line/webhook', lineMiddleware(lineConfig));

  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap().catch(error => {
  console.error('Failed to start application', error);
});

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS設定を追加
  app.enableCors({
    origin: [
      'https://oripa-shijon.com', 
      'http://localhost:3000', 
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin', 
      'X-Requested-With', 
      'Content-Type', 
      'Accept', 
      'Authorization',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

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

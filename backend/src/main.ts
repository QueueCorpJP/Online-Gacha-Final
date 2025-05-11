import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://oripa-shijon.com',
      'https://www.oripa-shijon.com',
      'https://api.oripa-shijon.com',
      // Add wildcard as fallback to ensure CORS works
      '*'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
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

  app.use(bodyParser.json({
    verify: (req, res, buf) => {
      // req.rawBody = buf.toString();
      (req as any).rawBody = buf.toString();
    },
    limit: '50mb'
  }));
  app.use(bodyParser.urlencoded({ 
    extended: true,
    limit: '50mb'
  }));

  const lineConfig = {
    channelSecret: process.env.LINE_CLIENT_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
  };

  app.use('/line/webhook', lineMiddleware(lineConfig));

  // const config = new DocumentBuilder()
  //   .setTitle('Gacha API')
  //   .setDescription('API documentation for Online Trading Card Gacha Website')
  //   .setVersion('1.0')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document
  //dd
  await app.listen(3001);
}
bootstrap();

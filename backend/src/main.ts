import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { middleware as lineMiddleware } from '@line/bot-sdk';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://oripa-shijon.com',
      'https://www.oripa-shijon.com',
      'https://api.oripa-shijon.com'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const lineConfig = {
    channelSecret: process.env.LINE_CLIENT_SECRET,
  };

  app.use('/line/callback', lineMiddleware(lineConfig));

  // const config = new DocumentBuilder()
  //   .setTitle('Gacha API')
  //   .setDescription('API documentation for Online Trading Card Gacha Website')
  //   .setVersion('1.0')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
}
bootstrap();

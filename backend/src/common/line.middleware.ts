import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as line from '@line/bot-sdk';

@Injectable()
export class LineMiddleware implements NestMiddleware {
  private readonly middlewareFn;

  constructor() {
    const config = {
      channelSecret: process.env.LINE_CLIENT_SECRET, // ensure this is set in your env
    };
    this.middlewareFn = line.middleware(config);
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.middlewareFn(req, res, next);
  }
}

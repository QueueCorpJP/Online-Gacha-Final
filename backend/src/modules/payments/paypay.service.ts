import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
const PAYPAY = require('@paypayopa/paypayopa-sdk-node');

@Injectable()
export class PayPayService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly merchantId: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PAYPAY_API_KEY');
    this.apiSecret = this.configService.get<string>('PAYPAY_API_SECRET');
    this.merchantId = this.configService.get<string>('PAYPAY_MERCHANT_ID');
    this.baseUrl = this.configService.get<string>('PAYPAY_API_URL', 'https://stg-api.paypay.ne.jp');

    // Configure PayPay SDK
    PAYPAY.Configure({
      clientId: this.apiKey,
      clientSecret: this.apiSecret,
      merchantId: this.merchantId,
      productionMode: this.baseUrl.includes('stg-api') ? false : true,
    });
  }

  async createPayment(params: {
    amount: number;
    orderDescription: string;
    redirectUrl: string;
    userId: string;
  }) {
    const { amount, orderDescription } = params;
    const merchantPaymentId = uuidv4();

    const payload = {
      merchantPaymentId,
      amount: {
        amount,
        currency: "JPY"
      },
      codeType: "ORDER_QR",
      orderDescription,
      isAuthorization: false,
      redirectUrl: `${process.env.APP_HOST_NAME}/complete?merchant-payment-id=${merchantPaymentId}`,
      redirectType: "WEB_LINK",
    };

    try {
      // Changed from CreatePayment to QRCodeCreate
      const response = await PAYPAY.QRCodeCreate(payload);
      return response;
    } catch (error) {
      console.error('PayPay API Error:', error);
      throw error;
    }
  }
}

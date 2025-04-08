export class PAYPAY {
  private apiKey: string;
  private apiSecret: string;
  private merchantId: string;
  private isProduction: boolean;

  constructor(config: {
    apiKey: string;
    apiSecret: string;
    merchantId: string;
    isProduction: boolean;
  }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.merchantId = config.merchantId;
    this.isProduction = config.isProduction;
  }

  async createPayment(params: {
    merchantPaymentId: string;
    amount: {
      amount: number;
      currency: string;
    };
    orderDescription: string;
    redirectUrl: string;
    redirectType: string;
  }) {
    const baseUrl = this.isProduction
      ? 'https://api.paypay.ne.jp'
      : 'https://stg-api.paypay.ne.jp';

    const response = await fetch(`${baseUrl}/v2/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-KEY': this.apiSecret,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to create PayPay payment'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  }
}
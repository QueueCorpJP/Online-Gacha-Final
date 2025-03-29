export class PayPayClient {
  private apiKey: string;
  private apiSecret: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.PAYPAY_API_KEY!;
    this.apiSecret = process.env.PAYPAY_API_SECRET!;
    this.apiUrl = process.env.PAYPAY_API_URL!;
  }

  async createQRCodePayment(params: {
    merchantPaymentId: string;
    amount: {
      amount: number;
      currency: string;
    };
    orderDescription: string;
    isAuthorization: boolean;
    redirectUrl: string;
    redirectType: string;
  }) {
    const response = await fetch(`${this.apiUrl}/v2/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-KEY': this.apiSecret,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('PayPay API request failed');
    }

    return response.json();
  }

  async getPaymentDetails(orderId: string) {
    const response = await fetch(`${this.apiUrl}/v2/payments/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-KEY': this.apiSecret,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PayPay payment details');
    }

    return response.json();
  }
}

export async function getPayPayOrderStatus(orderId: string) {
  const client = new PayPayClient();
  const data = await client.getPaymentDetails(orderId);
  
  return {
    status: data.status,
    amount: data.amount,
    orderID: data.orderID,
  };
}
import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import axios from 'axios';
import * as crypto from 'crypto';
import { Payment } from './entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CoinService } from '../coin/services/coin.service';
import { ReferralService } from '../referrals/referral.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly PAYPAY_API_URL: string;
  private readonly PAYPAY_API_KEY: string;
  private readonly PAYPAY_API_SECRET: string;
  private readonly PAYPAY_MERCHANT_ID: string;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private userService: UserService,
    private coinService: CoinService,
    private referralService: ReferralService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      // apiVersion: '2025-01-27.acacia',
      apiVersion: '2025-01-27.acacia',
    });
    
    this.PAYPAY_API_URL = process.env.PAYPAY_API_URL || 'https://stg-api.paypay.ne.jp';
    this.PAYPAY_API_KEY = process.env.PAYPAY_API_KEY;
    this.PAYPAY_API_SECRET = process.env.PAYPAY_API_SECRET;
    this.PAYPAY_MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
  }

  async getAllPayments(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC'
  ) {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      relations: ['user'],
      order: { [sortBy]: order },
      skip,
      take: limit,
    });

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchPaymentsByUserId(userId: string) {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async refundPayment(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'success') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (payment.method === 'stripe' && payment.stripePaymentIntentId) {
      await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });
    } else if (payment.method === 'paypay' && payment.payPayPaymentId) {
      return this.refundPayPayPayment(payment.id, payment.user.id);
    }

    payment.status = 'refunded';
    await this.paymentRepository.save(payment);

    const user = payment.user;
    if (user.coinBalance < payment.coins) {
      throw new BadRequestException('Insufficient coin balance for refund');
    }
    
    user.coinBalance -= payment.coins;
    await this.userRepository.save(user);

    return payment;
  }

  async createPaymentIntent(userId: string, amount: number, coins: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create payment intent with Stripe

    console.log("amount", amount);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount, 
      currency: 'jpy',
      metadata: {
        userId,
        coins,
      },
    });

    // Create payment record
    const payment = this.paymentRepository.create({
      user,
      amount,
      coins,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      method: 'stripe',
    });

    await this.paymentRepository.save(payment);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if payment was already processed
    if (payment.status === 'success') {
      throw new BadRequestException('Payment already processed');
    }

    // Verify payment status with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      payment.status = 'success';
      await this.paymentRepository.save(payment);

      const user = payment.user;
      
      // Calculate 1% bonus for the purchaser
      const purchaserBonus = Math.floor(paymentIntent.amount * 0.01);
      
      // Update user's coin balance
      user.coinBalance += paymentIntent.amount;
      await this.userRepository.save(user);

      // Create coin transaction for the purchase
      await this.coinService.purchaseCoins(
        user.id,
        paymentIntent.amount,
        `purchase`
      );

      // Create coin transaction for the purchaser's bonus
      

      // Handle referral bonus
      if (user.referredBy && user.id !== user.referredBy) {
        const referrer = await this.userRepository.findOne({
          where: { id: user.referredBy }
        });

        if (referrer) {
          // Calculate 1% bonus for the referrer
          
          // Update referrer's balance
          referrer.coinBalance += purchaserBonus;
          await this.userRepository.save(referrer);

          if (purchaserBonus > 0) {
            await this.coinService.purchaseCoins(
              referrer.id,
              purchaserBonus,
              'earning',
              `Referral bonus from ${user.email}'s purchase`,
            );
          }

          // Create transaction record for referral bonus
          
        }
      }

      return {
        success: true,
        newBalance: user.coinBalance,
        payment,
      };
    } else {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
      throw new BadRequestException('Payment failed');
    }
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.method === 'stripe' && payment.stripePaymentIntentId) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        payment.stripePaymentIntentId
      );
      return {
        status: paymentIntent.status,
        payment,
      };
    } else if (payment.method === 'paypay' && payment.payPayPaymentId) {
      const requestUrl = `${this.PAYPAY_API_URL}/v2/payments/${payment.payPayPaymentId}`;
      const headers = this.generatePayPayHeaders(requestUrl, 'GET');
      const response = await axios.get(requestUrl, { headers });
      return {
        status: response.data.data.status.toLowerCase(),
        payment,
      };
    }

    return {
      status: payment.status,
      payment,
    };
  }

  // PayPay specific methods
  private generatePayPayHeaders(requestUrl: string, method: string, body?: any): Record<string, string> {
    const timestamp = Date.now();
    const signature = crypto.createHmac('sha256', this.PAYPAY_API_SECRET)
      .update(`${timestamp}${method}${requestUrl}${body ? JSON.stringify(body) : ''}`)
      .digest('base64');
    return {
      'X-PP-Api-Key': this.PAYPAY_API_KEY,
      'X-PP-Timestamp': timestamp.toString(),
      'X-PP-Signature': signature,
    };
  }

  async createPayPayPayment({
    userId,
    amount,
    coins,
    orderDescription,
    redirectUrl
  }: {
    userId: string;
    amount: number;
    coins: number;
    orderDescription: string;
    redirectUrl: string;
  }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payPayPayment = await axios.post(`${this.PAYPAY_API_URL}/v2/payments`, {
      merchantId: this.PAYPAY_MERCHANT_ID,
      amount: amount, 
      currency: 'JPY',
      orderId: `order_${userId}`,
      orderDescription,
      redirectUrl,
      paymentMethods: ['creditCard', 'bankTransfer', 'payPayWallet'],
      metadata: {
        userId,
        coins,
      },
    }, {
      headers: this.generatePayPayHeaders(`${this.PAYPAY_API_URL}/v2/payments`, 'POST'),
    });

    const payment = this.paymentRepository.create({
      user,
      amount,
      coins,
      status: 'pending',
      payPayPaymentId: payPayPayment.data.data.paymentId,
      method: 'paypay',
    });

    await this.paymentRepository.save(payment);

    return {
      paymentId: payPayPayment.data.data.paymentId,
      payment,
    };
  }

  async verifyPayPayPayment(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.user.id !== userId) {
      throw new BadRequestException('Invalid user for this payment');
    }

    const requestUrl = `${this.PAYPAY_API_URL}/v2/payments/${payment.payPayPaymentId}`;
    const headers = this.generatePayPayHeaders(requestUrl, 'GET');
    const response = await axios.get(requestUrl, { headers });

    if (response.data.data.status === 'COMPLETED') {
      payment.status = 'success';
      await this.paymentRepository.save(payment);

      const user = payment.user;
      user.coinBalance += payment.coins;
      await this.userRepository.save(user);

      return {
        success: true,
        newBalance: user.coinBalance,
        payment,
      };
    } else {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
      throw new BadRequestException('Payment failed');
    }
  }

  async handlePayPayWebhook(signature: string, payload: any) {
    const expectedSignature = crypto.createHmac('sha256', this.PAYPAY_API_SECRET)
      .update(JSON.stringify(payload))
      .digest('base64');

    if (signature !== expectedSignature) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const { paymentId, status } = payload.data;

    const payment = await this.paymentRepository.findOne({
      where: { payPayPaymentId: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (status === 'COMPLETED') {
      payment.status = 'success';
      await this.paymentRepository.save(payment);

      const user = payment.user;
      user.coinBalance += payment.coins;
      await this.userRepository.save(user);

      return {
        success: true,
        newBalance: user.coinBalance,
        payment,
      };
    } else {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
      throw new HttpException('Payment failed', HttpStatus.BAD_REQUEST);
    }
  }

  async refundPayPayPayment(paymentId: string, userId: string, reason?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.user.id !== userId) {
      throw new BadRequestException('Invalid user for this payment');
    }

    if (payment.status !== 'success') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    const requestUrl = `${this.PAYPAY_API_URL}/v2/payments/${payment.payPayPaymentId}/refunds`;
    const headers = this.generatePayPayHeaders(requestUrl, 'POST', {
      paymentId: payment.payPayPaymentId,
      reason,
    });
    const response = await axios.post(requestUrl, {
      paymentId: payment.payPayPaymentId,
      reason,
    }, {
      headers,
    });

    payment.status = 'refunded';
    await this.paymentRepository.save(payment);

    const user = payment.user;
    if (user.coinBalance < payment.coins) {
      throw new BadRequestException('Insufficient coin balance for refund');
    }
    
    user.coinBalance -= payment.coins;
    await this.userRepository.save(user);

    return {
      success: true,
      newBalance: user.coinBalance,
      payment,
    };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const payment = await this.paymentRepository.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        relations: ['user'],
      });

      if (payment) {
        payment.status = 'success';
        await this.paymentRepository.save(payment);

        const user = payment.user;
        user.coinBalance += payment.coins;
        await this.userRepository.save(user);

        return {
          success: true,
          newBalance: user.coinBalance,
          payment,
        };
      }
    }

    return {
      success: false,
      message: 'Unknown event type',
    };
  }
}

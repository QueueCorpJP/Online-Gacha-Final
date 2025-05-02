import { Controller, Post, Body, Get, Param, UseGuards, Delete, Headers, Req, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from 'src/common/auth.guard';
import { AdminGuard } from 'src/common/admin.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PayPayService } from './paypay.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly payPayService: PayPayService,
  ) {}

  // Add these new admin endpoints
  @Get('')
  // @UseGuards(AdminGuard)
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC'
  ) {
    return this.paymentService.getAllPayments(page, limit, sortBy, order);
  }

  @Get('admin/payments/search')
  // @UseGuards(AdminGuard)
  async searchPayments(@Query('userId') userId: string) {
    return this.paymentService.searchPaymentsByUserId(userId);
  }

  @Get('user/:userId')
  async getUserPayments(@Param('userId') userId: string) {
    return this.paymentService.searchPaymentsByUserId(userId);
  }

  @Delete(':id')
  async refundPayment(@Param('id') id: string) {
    return this.paymentService.refundPayment(id);
  }

  @Post('create-intent')
  async createPaymentIntent(
    @CurrentUser() user: User,
    @Body() body: { amount: number; coins: number }
  ) {
    return this.paymentService.createPaymentIntent(
      user.id,
      body.amount,
      body.coins
    );
  }

  @Post('confirm')
  async confirmPayment(
    @Body() body: { paymentIntentId: string }
  ) {
    return this.paymentService.confirmPayment(body.paymentIntentId);
  }

  @Get('status/:id')
  async getPaymentStatus(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleStripeWebhook(
      signature,
      request.rawBody
    );
  }

  // New PayPay endpoints
  @Post('paypay/create')
  async createPayPayPayment(
    @CurrentUser() user: User,
    @Body() body: { 
      amount: number; 
      coins: number;
      orderDescription?: string;
      redirectUrl: string;
    }
  ) {
    return this.payPayService.createPayment({
      userId: user.id,
      amount: body.amount,
      orderDescription: body.orderDescription || `${body.coins}コインチャージ`,
      redirectUrl: body.redirectUrl
    });
  }

  @Post('paypay/verify')
  async verifyPayPayPayment(
    @CurrentUser() user: User,
    @Body() body: { paymentId: string }
  ) {
    return this.paymentService.verifyPayPayPayment(body.paymentId, user.id);
  }

  @Post('paypay/webhook')
  async handlePayPayWebhook(
    @Headers('paypay-signature') signature: string,
    @Body() payload: any
  ) {
    return this.paymentService.handlePayPayWebhook(signature, payload);
  }

  @Post('paypay/refund')
  async refundPayPayPayment(
    @CurrentUser() user: User,
    @Body() body: { paymentId: string; reason?: string }
  ) {
    return this.paymentService.refundPayPayPayment(body.paymentId, user.id, body.reason);
  }
}



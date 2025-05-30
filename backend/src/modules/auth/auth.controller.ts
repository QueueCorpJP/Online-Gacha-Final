import { Controller, Post, Body, ValidationPipe, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

interface RegisterDto {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() request: Request
  ) {
    return this.authService.login(body.email, body.password, request);
  }

  @Post('validate')
  // @UseGuards(AuthGuard)
  async validateUser() {
    return { message: 'Token is valid' };
  }

  @Post('verify-otp')
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOTP(body.email, body.otp);
  }

  @Post('resend-otp')
  async resendOTP(@Body() body: { email: string }) {
    return this.authService.resendOTP(body.email);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
    @Req() request: Request
  ) {
    return this.authService.initiatePasswordReset(email, request);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
    @Req() request: Request
  ) {
    const { token, newPassword } = body;  
    return this.authService.resetPassword(token, newPassword, request);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD')
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    try {
      // Verify transporter connection
      await this.transporter.verify();
      
      const mailOptions = {
        from: `"SHIJON" <${this.configService.get<string>('GMAIL_USER')}>`,
        to: email,
        subject: '認証コードの確認',
        html: `
          <h1>認証コードの確認</h1>
          <p>認証コード: <strong>${otp}</strong></p>
          <p>このコードは15分後に期限切れとなります。</p>
          <p>このコードをリクエストしていない場合は、このメールを無視してください。</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      
      // Check for specific error types and provide more detailed error messages
      if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Please check GMAIL_USER and GMAIL_APP_PASSWORD');
      } else if (error.code === 'ESOCKET') {
        throw new Error('Failed to connect to email server. Please check your network connection');
      }
      
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    try {
      await this.transporter.verify();
      
      const mailOptions = {
        from: `"SHIJON" <${this.configService.get<string>('GMAIL_USER')}>`,
        to: email,
        subject: 'パスワードリセットのリクエスト',
        html: `
          <h1>パスワードリセット</h1>
          <p>パスワードをリセットするには、以下のリンクをクリックしてください：</p>
          <a href="${resetUrl}">パスワードをリセット</a>
          <p>このリンクは1時間後に期限切れとなります。</p>
          <p>このリクエストをしていない場合は、このメールを無視してください。</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send password reset email:', error);
      if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Please check GMAIL_USER and GMAIL_APP_PASSWORD');
      } else if (error.code === 'ESOCKET') {
        throw new Error('Failed to connect to email server. Please check your network connection');
      }
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
}

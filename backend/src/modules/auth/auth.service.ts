import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '../user/entities/user.entity';
import { OTP } from './entities/otp.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { SecurityLogService } from '../security/security-log.service';
import { SecurityEventType } from '../security/security-log.entity';
import { Request } from 'express';
import { LineSettings } from '../line/entities/line-settings.entity';
import { InviteCode } from '../invite/entities/invite-code.entity';

interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  roles?: UserRole[];
}

interface JwtPayload {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LineSettings)
    private readonly lineSettingsRepository: Repository<LineSettings>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(InviteCode)
    private readonly inviteCodeRepository: Repository<InviteCode>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly securityLogService: SecurityLogService,
  ) {}

  async register(registerData: RegisterData) {
    // Check if user already exists (email or username)
    const existingUserByEmail = await this.userRepository.findOne({ 
      where: { email: registerData.email } 
    });
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByUsername = await this.userRepository.findOne({ 
      where: { username: registerData.username } 
    });
    if (existingUserByUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Validate password
    if (registerData.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    // 招待コードの処理
    let referredBy = null;
    if (registerData.referralCode) {
      const inviteCode = await this.inviteCodeRepository.findOne({
        where: { 
          code: registerData.referralCode,
          isUsed: false,
          expiresAt: MoreThan(new Date())
        }
      });
      
      if (inviteCode) {
        referredBy = inviteCode.createdById;
        
        // 招待コードを使用済みにマーク
        inviteCode.isUsed = true;
        inviteCode.usedAt = new Date();
        inviteCode.usedById = null; // 新規ユーザーのIDは後で設定
        await this.inviteCodeRepository.save(inviteCode);
      }
    }

    // Create new user with inactive status
    const user = this.userRepository.create({
      email: registerData.email,
      password: hashedPassword,
      username: registerData.username,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      roles: registerData.roles || [UserRole.USER],
      status: UserStatus.INACTIVE, // Set initial status as inactive
      coinBalance: 0,
      referredBy, // 招待者のIDを設定
    });

    const savedUser = await this.userRepository.save(user);

    // 招待コードが使用された場合、usedByIdを更新
    if (registerData.referralCode && referredBy) {
      await this.inviteCodeRepository.update(
        { code: registerData.referralCode },
        { usedById: savedUser.id }
      );
    }

    const lineSettings = this.lineSettingsRepository.create({
      userId: savedUser.id,
      isConnected: false,
      notifications: false,
    });
    
    await this.lineSettingsRepository.save(lineSettings);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis or your preferred storage with expiration
    await this.storeOTP(user.email, otp);

    // Send OTP email
    await this.mailService.sendOTPEmail(user.email, otp);

    // Return user data without password
    const { password: _, ...userData } = user;
    return {
      user: userData,
    };
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string, request: Request) {
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'username', 'roles', 'status'] 
    });

    const ip = this.securityLogService.getClientIp(request);

    if (!user) {
      await this.securityLogService.logSecurityEvent(
        SecurityEventType.LOGIN_FAILED,
        ip,
        `Failed login attempt for email: ${email}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.securityLogService.logSecurityEvent(
        SecurityEventType.LOGIN_FAILED,
        ip,
        `Invalid password for user: ${email}`,
        user.id
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    switch (user.status) {
      case UserStatus.SUSPENDED:
        await this.securityLogService.logSecurityEvent(
          SecurityEventType.LOGIN_FAILED,
          ip,
          `Suspended user attempted login: ${email}`,
          user.id
        );
        throw new UnauthorizedException('アカウントが一時停止されています。');
      case UserStatus.BANNED:
        await this.securityLogService.logSecurityEvent(
          SecurityEventType.LOGIN_FAILED,
          ip,
          `Banned user attempted login: ${email}`,
          user.id
        );
        throw new UnauthorizedException('アカウントが利用停止されています。');
      case UserStatus.INACTIVE:
        await this.securityLogService.logSecurityEvent(
          SecurityEventType.LOGIN_FAILED,
          ip,
          `Inactive user attempted login: ${email}`,
          user.id
        );
        throw new UnauthorizedException('メールアドレスの確認が必要です。');
    }

    await this.securityLogService.logSecurityEvent(
      SecurityEventType.LOGIN_SUCCESS,
      ip,
      `Successful login`,
      user.id
    );

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles
    };

    console.log(user);

    const { password: _, ...userData } = user;
    return {
      user: userData,
      token: this.jwtService.sign(payload)
    };
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    console.log(user);
    const { password: _, ...userData } = user;
    return userData;
  }

  async createAdmin(adminData: RegisterData) {
    return this.register({
      ...adminData,
      roles: [UserRole.ADMIN]
    });
  }

  async verifyOTP(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const storedOTP = await this.getStoredOTP(email);
    if (storedOTP === null || storedOTP !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Activate user
    user.status = UserStatus.ACTIVE;
    await this.userRepository.save(user);

    // Clear OTP
    await this.clearOTP(email);

    // Generate JWT token for automatic login
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles
    };

    const { password: _, ...userData } = user;
    return {
      message: 'Email verified successfully',
      user: userData,
      token: this.jwtService.sign(payload)
    };
  }

  async resendOTP(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store new OTP
    await this.storeOTP(email, otp);

    // Send new OTP email
    await this.mailService.sendOTPEmail(email, otp);

    return { message: 'OTP resent successfully' };
  }

  async initiatePasswordReset(email: string, request: Request) {
    const user = await this.userRepository.findOne({ where: { email } });
    const ip = this.securityLogService.getClientIp(request);

    await this.securityLogService.logSecurityEvent(
      SecurityEventType.PASSWORD_RESET_REQUEST,
      ip,
      `Password reset requested for email: ${email}`,
      user?.id
    );

    if (!user) {
      // Still return success to prevent email enumeration
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Hash token before saving
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Save token to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetTokenExpiry;
    await this.userRepository.save(user);

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(token: string, newPassword: string, request: Request) {
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Find user with valid reset token
    const user = await this.userRepository.findOne({
      where: {
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    const ip = this.securityLogService.getClientIp(request);
    
    await this.securityLogService.logSecurityEvent(
      SecurityEventType.PASSWORD_RESET_SUCCESS,
      ip,
      'Password reset successful',
      user.id
    );

    return { message: 'Password reset successful' };
  }

  // Helper methods for OTP storage (implement these based on your storage solution)
  private async storeOTP(email: string, otp: string): Promise<void> {
    // Clear any existing OTP for this email
    await this.otpRepository.delete({ email });

    // Create new OTP record
    const otpEntity = this.otpRepository.create({
      email,
      code: otp,
      isUsed: false,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // expires in 15 minutes
    });

    await this.otpRepository.save(otpEntity);
  }

  private async getStoredOTP(email: string): Promise<string | null> {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        email,
        isUsed: false,
        expiresAt: MoreThan(new Date())
      }
    });

    return otpRecord ? otpRecord.code : null;
  }

  private async clearOTP(email: string): Promise<void> {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        email,
        isUsed: false,
      },
    });

    if (otpRecord) {
      otpRecord.isUsed = true;
      await this.otpRepository.save(otpRecord);
    }
  }
}



import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LineSettings } from './entities/line-settings.entity';
import { UpdateLineSettingsDto } from './dto/update-line-settings.dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { LineConfig } from 'src/config/line.config';

@Injectable()
export class LineService {
  constructor(
    @InjectRepository(LineSettings)
    private readonly lineSettingsRepository: Repository<LineSettings>,
    private readonly configService: ConfigService
  ) {}

  getLoginUrl(): { url: string; state: string } {
    const state = uuidv4(); // Generate a unique state
    const clientId = this.configService.get<string>('LINE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('LINE_REDIRECT_URI');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'openid profile'
    });

    const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
    // const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LineConfig.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile&state=${state}`;

    // Store the state in a database or user session for later verification
    // For simplicity, we return the state along with the URL
    return { url: authUrl, state };
  }

  async generateLineAuthUrl(userId: string): Promise<string> {
    const clientId = this.configService.get<string>('LINE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('LINE_CALLBACK_URL');
    const state = userId; // Using userId as state parameter for verification

    const baseUrl = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'profile openid',
      bot_prompt: 'normal'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async getSettings(userId: string) {
    const settings = await this.lineSettingsRepository.findOne({
      where: { userId }
    });

    if (!settings) {
      return {
        isConnected: false,
        notifications: false
      };
    }

    return settings;
  }

  async updateSettings(userId: string, updateDto: UpdateLineSettingsDto) {
    let settings = await this.lineSettingsRepository.findOne({
      where: { userId }
    });

    console.log(updateDto);

    if (!settings) {
      settings = this.lineSettingsRepository.create({
        userId,
        isConnected: false,
        ...updateDto
      });
    } else {
      Object.assign(settings, updateDto);
    }

    return this.lineSettingsRepository.save(settings);
  }

  async connect(userId: string): Promise<LineSettings> {
    let settings = await this.lineSettingsRepository.findOne({
      where: { userId }
    });

    if (!settings) {
      settings = this.lineSettingsRepository.create({
        userId,
        isConnected: true,
        notifications: false
      });
    } else {
      settings.isConnected = true;
    }

    return this.lineSettingsRepository.save(settings);
  }

  async disconnect(userId: string): Promise<{ success: boolean }> {
    const settings = await this.lineSettingsRepository.findOne({
      where: { userId }
    });

    if (settings) {
      settings.isConnected = false;
      settings.notifications = false;
      await this.lineSettingsRepository.save(settings);
    }

    return { success: true };
  }

  async handleLineCallback(code: string, state: string, userId: string): Promise<void> {
    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        'https://api.line.me/oauth2/v2.1/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.configService.get<string>('LINE_REDIRECT_URI'),
          client_id: this.configService.get<string>('LINE_CLIENT_ID'),
          client_secret: this.configService.get<string>('LINE_CLIENT_SECRET'),
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log(tokenResponse);

      const accessToken = tokenResponse.data.access_token;

      // Get LINE profile
      const profileResponse = await axios.get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("profile", profileResponse);

      const lineUserId = profileResponse.data.userId;

      // Save settings with both user ID and LINE user ID
      let settings = await this.lineSettingsRepository.findOne({
        where: { userId }
      });

      if (!settings) {
        settings = this.lineSettingsRepository.create({
          userId,
          lineUserId,
          isConnected: true,
          notifications: false
        });
      } else {
        settings.lineUserId = lineUserId;
        settings.isConnected = true;
      }

      await this.lineSettingsRepository.save(settings);
    } catch (error) {
      console.error('Failed to handle LINE callback:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
      }
      throw new Error('Failed to handle LINE callback');
    }
  }

  async getUserId(authCode: string): Promise<string> {
    try {
      const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', null, {
        params: {
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: LineConfig.redirectUri,
          client_id: LineConfig.clientId,
          client_secret: LineConfig.clientSecret,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const accessToken = tokenResponse.data.access_token;

      const profileResponse = await axios.get('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return profileResponse.data.userId;
    } catch (error) {
      console.log(`Failed to get user ID: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(lineUserId: string, message: { text: string }): Promise<void> {
    try {
      // Validate LINE user ID format
      if (!lineUserId || typeof lineUserId !== 'string') {
        throw new Error('Invalid LINE user ID');
      }

      // Validate message content
      if (!message.text || typeof message.text !== 'string') {
        throw new Error('Invalid message content');
      }

      const payload = {
        to: lineUserId,
        messages: [{
          type: 'text',
          text: message.text.replace(/\\n/g, '\n')
        }]
      };

      const channelAccessToken = this.configService.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
      if (!channelAccessToken) {
        throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
      }

      console.log('Sending LINE message with payload:', JSON.stringify(payload));

      const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second

      let lastError;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await axios.post(
            LINE_API_URL,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`,
                'X-Line-Retry-Key': uuidv4() // Add idempotency key
              },
              timeout: 5000 // 5 seconds timeout
            }
          );

          // If successful, return early
          if (response.status === 200) {
            return;
          }

          lastError = new Error(`LINE API responded with status ${response.status}`);
        } catch (error) {
          lastError = error;
          
          // Don't retry on certain error types
          if (error.response?.status === 400 || // Bad request
              error.response?.status === 403 || // Forbidden
              error.response?.status === 404) { // Not found
            throw error;
          }

          // If not the last attempt, wait before retrying
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            continue;
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;
    } catch (error) {
      console.error('Failed to send LINE message:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('LINE API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(`Failed to send LINE message: ${errorMessage}`);
      }
      throw error;
    }
  }

  async findByLineUserId(lineUserId: string): Promise<LineSettings | null> {
    return this.lineSettingsRepository.findOne({
      where: { lineUserId }
    });
  }

  async saveLineUserId(lineUserId: string, userId?: string): Promise<LineSettings> {
    let settings = await this.lineSettingsRepository.findOne({
      where: { lineUserId }
    });

    console.log("userID", userId);

    if (!settings && userId) {
      // If no settings exist but we have a userId, create new settings
      settings = this.lineSettingsRepository.create({
        userId,
        lineUserId,
        isConnected: true,
        notifications: false
      });
    } else if (settings) {
      // If settings exist, update the lineUserId and connection status
      settings.lineUserId = lineUserId;
      settings.isConnected = true;
    }

    if (settings) {
      return this.lineSettingsRepository.save(settings);
    }

    // If no settings could be created/updated, throw an error
    throw new Error('Could not save LINE user ID');
  }
}

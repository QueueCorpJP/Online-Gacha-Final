import { Controller, Get, Post, Put, Body, UseGuards, Query, Req, Headers, HttpCode } from '@nestjs/common';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { LineService } from './line.service';
import { User } from '../user/entities/user.entity';
import { LineSettings } from './entities/line-settings.entity';
import { UpdateLineSettingsDto } from './dto/update-line-settings.dto';
import { Request } from 'express';
import * as crypto from 'crypto';
import * as line from '@line/bot-sdk';

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

@Controller('user/line')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @UseGuards(AuthGuard)
  @Get('settings')
  async getSettings(@CurrentUser() user: User): Promise<Partial<LineSettings>> {
    const settings = await this.lineService.getSettings(user.id);
    if ('userId' in settings) {
      return settings;
    }
    return {
      userId: user.id,
      lineUserId: null,
      isConnected: settings.isConnected,
      notifications: settings.notifications,
    };
  }

  @UseGuards(AuthGuard)
  @Post('connect')
  async connect(@CurrentUser() user: User): Promise<{ lineAuthUrl: string }> {
    const lineAuthUrl = await this.lineService.generateLineAuthUrl(user.id);
    return { lineAuthUrl };
  }

  @UseGuards(AuthGuard)
  @Get('login')
  getLoginUrl() {
    return { url: this.lineService.getLoginUrl() };
  }

  private async handleEvent(event: any) {
    // Only process text message events
    if (event.type !== 'message' || event.message.type !== 'text') {
      return null;
    }

    // Create an echo message
    const echo = { type: 'text', text: event.message.text };

    // Use LINE reply API to respond to the message
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: "textV2",
        text: event.message.text,
        substitution: {}
      }],
    });
  }


  @Get('callback')
  // @UseGuards(AuthGuard)
  async handleCallback(
    @Req() req: Request, 
    @Headers('x-line-signature') signature: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @CurrentUser() user: User,
    @Body() body: any
  ) {
    // Instead of accessing req.rawBody directly, we need to get the raw body data
    // You'll need to implement a middleware to expose the raw body
    // const rawBody = req.body; // Access the parsed body first

    // const results = await Promise.all(body.events.map(event => this.handleEvent(event)));


    // If you need the actual raw body string for signature validation:
    // Option 1: If you've set up body-parser with { verify: (req, res, buf) => { req.rawBody = buf.toString(); } }
    // const rawBody = (req as any).rawBody;
    
    // Option 2: If you're using Express's built-in JSON parser
    // const rawBodyStr = JSON.stringify(req.body);
    // const events = JSON.parse(rawBodyStr).events;
    // events.forEach(event => {
    //   if (event.type === 'follow') {
    //     // A "follow" event indicates a new friend has been added
    //     const userId = event.source.userId;
    //     console.log(`User ${userId} has added your official account as a friend.`);
    //     // You can now trigger additional actions, like sending a welcome message.
    //   }
    //   // Handle other event types if needed (e.g., message, unfollow)
    // });
    await this.lineService.handleLineCallback(code, state, user.id);
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Post('disconnect')
  async disconnect(@CurrentUser() user: User): Promise<{ success: boolean }> {
    await this.lineService.disconnect(user.id);
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Put('notifications')
  async updateNotifications(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateLineSettingsDto
  ): Promise<LineSettings> {
    return this.lineService.updateSettings(user.id, updateDto);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any): Promise<any> {
    const events = body.events;
    for (const event of events) {
      const lineUserId = event.source.userId;
      console.log('LINE userId from message:', lineUserId);

      try {
        // Find existing settings with this LINE userId
        let settings = await this.lineService.findByLineUserId(lineUserId);

        if (event.type === 'message' && event.message.type === 'text') {
          const messageText = event.message.text;
          
          // Check if message contains a connection code
          if (messageText.startsWith('CONNECT:')) {
            const userId = messageText.split(':')[1].trim();
            try {
              settings = await this.lineService.saveLineUserId(lineUserId, userId);
              await client.replyMessage({
                replyToken: event.replyToken,
                messages: [{
                  type: "text",
                  text: "Your LINE account has been successfully connected! You will now receive notifications here."
                }]
              });
            } catch (error) {
              console.error('Error saving LINE userId:', error);
              await client.replyMessage({
                replyToken: event.replyToken,
                messages: [{
                  type: "text",
                  text: "Sorry, there was an error connecting your account. Please try again or contact support."
                }]
              });
            }
          } else {
            // Handle regular messages
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [{
                type: "text",
                text: settings 
                  ? "Thank you for your message! How can I help you today?"
                  : "To connect your account, please send a message starting with 'CONNECT:' followed by your user ID."
              }]
            });
          }
        } else if (event.type === 'follow') {
          // Handle when user adds the bot as friend
          await client.pushMessage({
            to: lineUserId,
            messages: [{
              type: "text",
              text: settings
                ? "Welcome back! Your account is already connected."
                : "Thank you for adding me! To connect your account, please send a message starting with 'CONNECT:' followed by your user ID."
            }]
          });
        }
      } catch (error) {
        console.error('Error handling webhook event:', error);
      }
    }
    
    return { status: 'OK' };
  }

  // @Get('callback')
  // async handleLineCallback(@Query() query: { code: string, state: string }): Promise<{ success: boolean }> {
  //   await this.lineService.handleLineCallback(query.code, query.state);
  //   return { success: true };
  // }
}


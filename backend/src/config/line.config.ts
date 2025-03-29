export const LineConfig = {
    clientId: process.env.LINE_CLIENT_ID || 'YOUR_LINE_CHANNEL_ID',
    clientSecret: process.env.LINE_CLIENT_SECRET || 'YOUR_LINE_CHANNEL_SECRET',
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    redirectUri: process.env.LINE_REDIRECT_URI || 'http://localhost:3000/line/callback',
  };
  
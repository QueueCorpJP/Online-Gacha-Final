import { api } from '@/lib/axios';

export interface GachaPurchaseStats {
  stats: {
    totalAmount: number;
    totalTransactions: number;
    averageAmount: number;
    maxAmount: number;
  };
  recentTransactions: {
    id: string;
    amount: number;
    createdAt: string;
    user: {
      id: string;
      username: string;
      profileUrl?: string;
    };
  }[];
}

export const coinService = {
  getGachaPurchaseStats: async (period?: 'daily' | 'weekly' | 'monthly'): Promise<GachaPurchaseStats> => {
    const response = await api.get('/coins/gacha-stats', {
      params: { period }
    });
    return response.data;
  }
};

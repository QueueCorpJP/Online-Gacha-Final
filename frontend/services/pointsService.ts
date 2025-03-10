import { api } from '@/lib/axios';

export interface PointsBalance {
  balance: number;
  lastUpdated: string;
}

export interface PurchasePointsResponse {
  newBalance: number;
  purchase: {
    id: string;
    amount: number;
    cost: number;
    timestamp: string;
  };
}

export const pointsService = {
  getBalance: async (): Promise<PointsBalance> => {
    const response = await api.get('/points/balance');
    return response.data;
  },

  purchasePoints: async (amount: number, paymentMethodId: string): Promise<PurchasePointsResponse> => {
    const response = await api.post('/points/purchase', {
      amount,
      paymentMethodId,
    });
    return response.data;
  },

  getTransactionHistory: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/coins/transactions', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default pointsService;
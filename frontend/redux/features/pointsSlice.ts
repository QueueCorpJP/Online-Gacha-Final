import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pointsService } from '@/services/pointsService'; 

interface PointsState {
  balance: number;
  loading: boolean;
  error: string | null;
  purchaseHistory: PurchaseRecord[];
  transactionHistory: PointsTransaction[];
  historyLoading: boolean;
  totalPages: number;
}

interface PurchaseRecord {
  id: string;
  amount: number;
  cost: number;
  timestamp: string;
}

interface PurchasePointsRequest {
  amount: number;
  paymentMethodId: string;
}

interface PointsTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  balance: number;
}

const initialState: PointsState = {
  balance: 0,
  loading: false,
  error: null,
  purchaseHistory: [],
  transactionHistory: [],
  historyLoading: false,
  totalPages: 1,
};

export const fetchPointsBalance = createAsyncThunk(
  'points/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pointsService.getBalance();
      return response.balance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch points balance');
    }
  }
);

export const purchasePoints = createAsyncThunk(
  'points/purchase',
  async (data: PurchasePointsRequest, { rejectWithValue }) => {
    try {
      const response = await pointsService.purchasePoints(data.amount, data.paymentMethodId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to purchase points');
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'points/fetchHistory',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await pointsService.getTransactionHistory(page);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPointsBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPointsBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchPointsBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(purchasePoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchasePoints.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.newBalance;
        state.purchaseHistory.unshift(action.payload.purchase);
      })
      .addCase(purchasePoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.transactionHistory = action.payload?.transactions || [];
        state.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default pointsSlice.reducer;

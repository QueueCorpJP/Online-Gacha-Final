import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    // ... other user fields if needed
  };
}

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '決済情報の取得に失敗しました');
    }
  }
);

export const searchPayments = createAsyncThunk(
  'payments/search',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/payments/search?userId=${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '決済情報の検索に失敗しました');
    }
  }
);

export const refundPayment = createAsyncThunk(
  'payments/refund',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '返金処理に失敗しました');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPayments: (state) => {
      state.payments = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(searchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refundPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.map(payment => 
          payment.id === action.payload.id 
            ? { ...payment, status: 'refunded' }
            : payment
        );
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPayments } = paymentSlice.actions;
export default paymentSlice.reducer;

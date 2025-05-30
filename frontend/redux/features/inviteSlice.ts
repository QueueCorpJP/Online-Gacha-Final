import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface InviteState {
  inviteCode: string | null;
  loading: boolean;
  error: string | null;
  inviteStats: {
    totalInvites: number;
    successfulInvites: number;
    pendingInvites: number;
  } | null;
}

const initialState: InviteState = {
  inviteCode: null,
  loading: false,
  error: null,
  inviteStats: null,
};

export const generateInviteCode = createAsyncThunk(
  'invite/generate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referrals/code');
      return response.data.referralCode;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invite code');
    }
  }
);

export const fetchInviteStats = createAsyncThunk(
  'invite/stats',
  async (_, { rejectWithValue }) => {
    try {
      // For now, return mock data since backend doesn't have stats endpoint
      return {
        totalInvites: 0,
        successfulInvites: 0,
        pendingInvites: 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invite stats');
    }
  }
);

export const submitInviteCode = createAsyncThunk(
  'invite/submit',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/invite/submit', { code });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit invite code');
    }
  }
);

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateInviteCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateInviteCode.fulfilled, (state, action) => {
        state.loading = false;
        state.inviteCode = action.payload;
      })
      .addCase(generateInviteCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInviteStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInviteStats.fulfilled, (state, action) => {
        state.loading = false;
        state.inviteStats = action.payload;
      })
      .addCase(fetchInviteStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitInviteCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitInviteCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitInviteCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default inviteSlice.reducer;

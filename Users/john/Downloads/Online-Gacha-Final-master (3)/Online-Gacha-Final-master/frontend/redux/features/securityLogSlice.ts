import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface SecurityLog {
  id: string;
  event: string;
  ip: string;
  timestamp: string;
  userId?: string;
  details?: string;
}

interface SecurityLogState {
  logs: SecurityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: SecurityLogState = {
  logs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  },
  loading: false,
  error: null,
};

export const fetchSecurityLogs = createAsyncThunk(
  'securityLogs/fetchLogs',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/security/logs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security logs');
    }
  }
);

const securityLogSlice = createSlice({
  name: 'securityLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecurityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecurityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSecurityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default securityLogSlice.reducer;

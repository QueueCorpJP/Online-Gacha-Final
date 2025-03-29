import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface ReportData {
  name: string;
  sales: number;
  users: number;
}

interface ReportState {
  data: ReportData[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchReportData = createAsyncThunk(
  'reports/fetchData',
  async (reportType: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/reports/${reportType}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'レポートの取得に失敗しました');
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/export',
  async ({ type, format }: { type: string; format: 'csv' | 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/reports/${type}/export/${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'エクスポートに失敗しました');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportSlice.reducer;
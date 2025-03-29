import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface SecuritySettings {
  ipRestriction: boolean;
  logMonitoring: boolean;
  alertEmail: string;
}

interface SecuritySettingsState {
  settings: SecuritySettings;
  loading: boolean;
  error: string | null;
}

const initialState: SecuritySettingsState = {
  settings: {
    ipRestriction: false,
    logMonitoring: true,
    alertEmail: 'alert@example.com',
  },
  loading: false,
  error: null,
};

export const fetchSecuritySettings = createAsyncThunk(
  'securitySettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/security/settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '設定の取得に失敗しました');
    }
  }
);

export const updateSecuritySettings = createAsyncThunk(
  'securitySettings/update',
  async (settings: SecuritySettings, { rejectWithValue }) => {
    try {
      const response = await api.put('/admin/security/settings', settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '設定の更新に失敗しました');
    }
  }
);

const securitySettingsSlice = createSlice({
  name: 'securitySettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecuritySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecuritySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSecuritySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSecuritySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSecuritySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default securitySettingsSlice.reducer;
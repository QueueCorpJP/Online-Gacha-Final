import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface InventorySettings {
  globalThreshold: string;
  notificationMethod: string;
  realTimeUpdates: boolean;
}

export interface InventorySettingsState {
  settings: InventorySettings;
  loading: boolean;
  error: string | null;
}

const initialState: InventorySettingsState = {
  settings: {
    globalThreshold: "20",
    notificationMethod: "line",
    realTimeUpdates: true,
  },
  loading: false,
  error: null,
};

export const fetchInventorySettings = createAsyncThunk(
  'inventorySettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateInventorySettings = createAsyncThunk(
  'inventorySettings/update',
  async (settings: InventorySettings, { rejectWithValue }) => {
    try {
      const response = await api.put('/inventory/settings', settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

const inventorySettingsSlice = createSlice({
  name: 'inventorySettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventorySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventorySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchInventorySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInventorySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventorySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateInventorySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default inventorySettingsSlice.reducer;

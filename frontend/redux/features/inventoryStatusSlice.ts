import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  percentage: number;
  threshold: number;
  status: 'LOW' | 'NORMAL' | 'HIGH';
}

interface InventoryStatusState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryStatusState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchInventoryStatus = createAsyncThunk(
  'inventoryStatus/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/status');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '在庫状況の取得に失敗しました');
    }
  }
);

export const updateItemThreshold = createAsyncThunk(
  'inventoryStatus/updateThreshold',
  async ({ itemId, threshold }: { itemId: string; threshold: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/inventory/threshold/${itemId}`, { threshold });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'しきい値の更新に失敗しました');
    }
  }
);

const inventoryStatusSlice = createSlice({
  name: 'inventoryStatus',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateItemThreshold.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      });
  },
});

export default inventoryStatusSlice.reducer;
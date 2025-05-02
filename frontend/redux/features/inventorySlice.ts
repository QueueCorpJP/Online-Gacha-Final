import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

export interface InventoryItem {
  id: string;
  name: string;
  rarity: number;
  imageUrl?: string;
  obtainedAt: string;
  status: 'available' | 'exchanged' | 'shipped';
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  filter: string;
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all'
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetch',
  async (filter: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory?filter=${filter}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const exchangeForPoints = createAsyncThunk(
  'inventory/exchange',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/${itemId}/exchange`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to exchange item');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(exchangeForPoints.fulfilled, (state, action) => {
        const exchangedItem = state.items.find(item => item.id === action.payload.id);
        if (exchangedItem) {
          exchangedItem.status = 'exchanged';
        }
      });
  },
});

export const { setFilter } = inventorySlice.actions;
export default inventorySlice.reducer;
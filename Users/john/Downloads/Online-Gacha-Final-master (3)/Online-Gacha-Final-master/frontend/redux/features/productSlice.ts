import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface Product {
  id: string;
  title: string;
  rating: number;
  price: number;
  isPricePerTry: boolean;
  remainingTime: string;
  image: string;
  category: string;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: {
    categories: string[];
    minPrice: number | null;
    maxPrice: number | null;
    ratings: number[];
    sortBy: string;
  };
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  filters: {
    categories: [],
    minPrice: null,
    maxPrice: null,
    ratings: [],
    sortBy: 'recommended'
  }
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (filters: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    sortBy?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get('/gacha', { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters } = productSlice.actions;
export default productSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryApi } from '@/services/categoryApi';
import type { Category, CreateCategoryInput, UpdateCategoryOrderInput } from '@/types/category';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryApi.getCategories();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (data: string, { rejectWithValue }) => {
    try {
      console.log(data);
      return await categoryApi.createCategory(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryApi.deleteCategory(id);
      return id;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

export const updateCategoryOrder = createAsyncThunk(
  'category/updateOrder',
  async (data: UpdateCategoryOrderInput, { rejectWithValue }) => {
    try {
      return await categoryApi.updateCategoryOrder(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category order');
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
      })
      .addCase(updateCategoryOrder.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default categorySlice.reducer;

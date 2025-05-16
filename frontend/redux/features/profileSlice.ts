import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface ProfileData {
  firstName: string;
  lastName: string;
  postalCode: string;
  address: string;
  phone: string;
  coinBalance: number;
  profileUrl?: string;
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  imageUploading: boolean;
  lastUploadedImage: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  imageUploading: false,
  lastUploadedImage: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (data: ProfileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadImage',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      let retries = 3;
      let response = null;
      
      while (retries > 0) {
        try {
          response = await api.post('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
            timeout: 30000,
      });
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setTimeout(() => {
        dispatch(fetchProfile());
      }, 500);
      
      return response?.data || { url: null };
    } catch (error: any) {
      setTimeout(() => {
        dispatch(fetchProfile());
      }, 1000);
      
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

export const deleteProfileImage = createAsyncThunk(
  'profile/deleteImage',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await api.delete('/profile/image');
      
      setTimeout(() => {
        dispatch(fetchProfile());
      }, 500);
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete image');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearImageUploadState: (state) => {
      state.imageUploading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.imageUploading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.imageUploading = false;
        if (state.data && action.payload?.url) {
          state.data.profileUrl = action.payload.url;
          state.lastUploadedImage = action.payload.url;
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.imageUploading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProfileImage.pending, (state) => {
        state.imageUploading = true;
        state.error = null;
      })
      .addCase(deleteProfileImage.fulfilled, (state) => {
        state.imageUploading = false;
        if (state.data) {
          state.data.profileUrl = undefined;
          state.lastUploadedImage = null;
        }
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.imageUploading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearImageUploadState } = profileSlice.actions;
export default profileSlice.reducer;

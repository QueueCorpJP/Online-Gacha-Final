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
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  imageUploading: false,
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
  async (file: File, { rejectWithValue }) => {
    try {
      console.log('プロフィール画像アップロード開始', { 
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size 
      });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('プロフィール画像アップロード成功', response.data);
      return response.data;
    } catch (error: any) {
      console.error('プロフィール画像アップロードエラー', error);
      
      if (error.response) {
        console.error('エラーレスポンス:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('リクエストエラー:', error.request);
      } else {
        console.error('その他のエラー:', error.message);
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

export const deleteProfileImage = createAsyncThunk(
  'profile/deleteImage',
  async (_, { rejectWithValue }) => {
    try {
      console.log('プロフィール画像削除開始');
      await api.delete('/profile/image');
      console.log('プロフィール画像削除成功');
      return true;
    } catch (error: any) {
      console.error('プロフィール画像削除エラー', error);
      
      if (error.response) {
        console.error('エラーレスポンス:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to delete image');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
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
        if (state.data) {
          state.data.profileUrl = action.payload.url;
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
        }
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.imageUploading = false;
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;

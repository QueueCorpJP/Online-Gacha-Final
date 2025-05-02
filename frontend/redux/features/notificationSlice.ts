import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationPayload {
  type: string;
  title: string;
  content: string;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  success: false,
};

export const sendNotification = createAsyncThunk(
  'notification/send',
  async (notification: NotificationPayload, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/send', notification);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '通知の送信に失敗しました');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '通知の取得に失敗しました');
    }
  }
);

export const fetchUserNotifications = createAsyncThunk(
  'notification/fetchUserNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '通知の取得に失敗しました');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '通知の更新に失敗しました');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetNotificationState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetNotificationState } = notificationSlice.actions;
export default notificationSlice.reducer;

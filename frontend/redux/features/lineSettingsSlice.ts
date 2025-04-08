import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'

interface LineSettingsState {
  isConnected: boolean
  notifications: boolean
  loading: boolean
  error: string | null
}

const initialState: LineSettingsState = {
  isConnected: false,
  notifications: false,
  loading: false,
  error: null,
}

export const fetchLineSettings = createAsyncThunk(
  'lineSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/line/settings')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch LINE settings')
    }
  }
)

export const connectLine = createAsyncThunk(
  'lineSettings/connect',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/line/connect')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to connect LINE account')
    }
  }
)

export const disconnectLine = createAsyncThunk(
  'lineSettings/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/line/disconnect')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect LINE account')
    }
  }
)

export const updateLineNotifications = createAsyncThunk(
  'lineSettings/updateNotifications',
  async (notifications: boolean, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/line/notifications', { notifications })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notifications settings')
    }
  }
)

const lineSettingsSlice = createSlice({
  name: 'lineSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLineSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLineSettings.fulfilled, (state, action) => {
        state.loading = false
        state.isConnected = action.payload.isConnected
        state.notifications = action.payload.notifications
      })
      .addCase(fetchLineSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(connectLine.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(connectLine.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(connectLine.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(disconnectLine.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(disconnectLine.fulfilled, (state) => {
        state.loading = false
        state.isConnected = false
        state.notifications = false
      })
      .addCase(disconnectLine.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateLineNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLineNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
      })
      .addCase(updateLineNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = lineSettingsSlice.actions
export default lineSettingsSlice.reducer

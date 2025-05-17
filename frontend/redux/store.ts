import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from '@/lib/redux-persist-storage'
import authReducer from './features/authSlice'
import categoryReducer from './features/categorySlice'
import gachaReducer from './features/gachaSlice'
import inventoryReducer from './features/inventorySlice'
import inventorySettingsReducer from './features/inventorySettingsSlice'
import inventoryStatusReducer from './features/inventoryStatusSlice'
import notificationReducer from './features/notificationSlice'
import paymentReducer from './features/paymentSlice'
import paymentMethodReducer from './features/paymentMethodSlice'
import profileReducer from './features/profileSlice'
import reportReducer from './features/reportSlice'
import securityLogReducer from './features/securityLogSlice'
import securitySettingsReducer from './features/securitySettingsSlice'
import inviteReducer from './features/inviteSlice'
import pointsReducer from './features/pointsSlice'
import lineSettingsReducer from './features/lineSettingsSlice'
import userReducer from './features/userSlice'
//a
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // only auth will be persisted
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    category: categoryReducer,
    gacha: gachaReducer,
    inventory: inventoryReducer,
    inventorySettings: inventorySettingsReducer,
    inventoryStatus: inventoryStatusReducer,
    notification: notificationReducer,
    payments: paymentReducer,
    paymentMethod: paymentMethodReducer,
    profile: profileReducer,
    reports: reportReducer,
    securityLogs: securityLogReducer,
    securitySettings: securitySettingsReducer,
    invite: inviteReducer,
    points: pointsReducer,
    lineSettings: lineSettingsReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

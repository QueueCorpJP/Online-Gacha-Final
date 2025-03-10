import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentMethodType = 'bank' | 'google-pay' | 'credit-card' | 'apple-pay' | 'paypay' | 'convenience';

interface PaymentMethodState {
  selectedMethod: PaymentMethodType | null;
}

const initialState: PaymentMethodState = {
  selectedMethod: "credit-card"
};

const paymentMethodSlice = createSlice({
  name: 'paymentMethod',
  initialState,
  reducers: {
    setPaymentMethod: (state, action: PayloadAction<PaymentMethodType>) => {
      state.selectedMethod = action.payload;
    },
    clearPaymentMethod: (state) => {
      state.selectedMethod = null;
    },
  },
});

export const { setPaymentMethod, clearPaymentMethod } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;

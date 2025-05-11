import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITransaction } from "@/interfaces/transaction";

interface TransactionState {
  currentTransaction: ITransaction | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  currentTransaction: null,
  loading: false,
  error: null,
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setCurrentTransaction: (state, action: PayloadAction<ITransaction>) => {
      state.currentTransaction = action.payload;
      // Clear any errors when setting a new transaction
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentTransaction,
  clearCurrentTransaction,
  setLoading,
  setError,
} = transactionSlice.actions;

export default transactionSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionFormValues } from "@/components/transactions/types";
import { IEventDetails } from "@/components/transactions/types";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { ITicket } from "@/components/payment/paymentSuccess/types";

export interface ReduxTransaction {
  id: string;
  event_id: string;
  user_id: string;
  quantity: number;
  attend_date: string;
  voucher_code?: string;
  coupon_code?: string;
  points_used: number;
  payment_method: string;
  total_pay_amount: number;
  voucher_discount?: number;
  coupon_discount?: number;
  status:
    | "waiting_for_payment"
    | "waiting_for_admin_confirmation"
    | "confirmed"
    | "rejected"
    | "expired"
    | "canceled";
  created_at: string;
  updated_at: string;
  event?: IEventDetails;
}

// Expanded interface to track the entire transaction flow
interface TransactionState {
  currentTransaction: ReduxTransaction | null;
  transactionForm: TransactionFormValues | null;
  discounts: {
    voucherId: string | null;
    voucherDiscount: number;
    couponId: string | null;
    couponDiscount: number;
    pointsUsed: number;
  };
  calculatedTotal: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  currentTickets: ITicket[];
}

const initialState: TransactionState = {
  currentTransaction: null,
  transactionForm: null,
  discounts: {
    voucherId: null,
    voucherDiscount: 0,
    couponId: null,
    couponDiscount: 0,
    pointsUsed: 0,
  },
  calculatedTotal: 0,
  subtotal: 0,
  loading: false,
  error: null,
  currentTickets: [],
};

// Load state from cookies if available
const loadStateFromCookies = (): TransactionState => {
  try {
    const savedState = getCookie("transactionState");
    if (savedState) {
      return JSON.parse(savedState as string);
    }
  } catch (e) {
    console.error("Failed to load state from cookies:", e);
  }
  return initialState;
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState: loadStateFromCookies(),
  reducers: {
    // Form handling
    setTransactionForm: (
      state,
      action: PayloadAction<TransactionFormValues>
    ) => {
      state.transactionForm = action.payload;
      saveStateToCookies(state);
    },

    // Discount handling
    applyVoucher: (
      state,
      action: PayloadAction<{ id: string; amount: number }>
    ) => {
      state.discounts.voucherId = action.payload.id;
      state.discounts.voucherDiscount = action.payload.amount;
      saveStateToCookies(state);
    },

    applyCoupon: (
      state,
      action: PayloadAction<{ id: string; amount: number }>
    ) => {
      state.discounts.couponId = action.payload.id;
      state.discounts.couponDiscount = action.payload.amount;
      saveStateToCookies(state);
    },

    applyPoints: (state, action: PayloadAction<number>) => {
      state.discounts.pointsUsed = action.payload;
      saveStateToCookies(state);
    },

    // Transaction handling
    setCurrentTransaction: (state, action: PayloadAction<ReduxTransaction>) => {
      state.currentTransaction = action.payload;
      state.error = null;
      saveStateToCookies(state);
    },

    updateTransactionStatus: (state, action: PayloadAction<string>) => {
      if (state.currentTransaction) {
        state.currentTransaction.status =
          action.payload as ReduxTransaction["status"];
        saveStateToCookies(state);
      }
    },

    setCurrentTickets: (state, action: PayloadAction<ITicket[]>) => {
      state.currentTickets = action.payload;
      saveStateToCookies(state);
    },

    // Utility actions
    setCalculatedTotal: (state, action: PayloadAction<number>) => {
      state.calculatedTotal = action.payload;
      saveStateToCookies(state);
    },

    setSubtotal: (state, action: PayloadAction<number>) => {
      state.subtotal = action.payload;
      saveStateToCookies(state);
    },

    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
      state.transactionForm = null;
      state.discounts = initialState.discounts;
      state.calculatedTotal = 0;
      state.currentTickets = [];
      deleteCookie("transactionState");
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

// Helper function to save state to cookies
const saveStateToCookies = (state: TransactionState) => {
  try {
    setCookie("transactionState", JSON.stringify(state), {
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  } catch (e) {
    console.error("Failed to save state to cookies:", e);
  }
};

export const {
  setTransactionForm,
  applyVoucher,
  applyCoupon,
  applyPoints,
  setCurrentTransaction,
  updateTransactionStatus,
  setCurrentTickets,
  setCalculatedTotal,
  setSubtotal,
  clearCurrentTransaction,
  setLoading,
  setError,
} = transactionSlice.actions;

export default transactionSlice.reducer;

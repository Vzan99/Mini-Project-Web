import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Match the JWT payload structure from your backend
export interface IPayloadLogin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface IAuth {
  user: IPayloadLogin;
  token: string;
  isLogin: boolean;
}

const initialState: IAuth = {
  user: {
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
  },
  token: "",
  isLogin: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state: IAuth,
      action: PayloadAction<{ token: string; user: IPayloadLogin }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLogin = true;

      // Also store in localStorage for persistence across refreshes
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      console.log("Login successful, state updated:", state);
    },
    logout: (state: IAuth) => {
      state.user = initialState.user;
      state.token = "";
      state.isLogin = false;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      console.log("Logout successful, state reset");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./features/eventSlice";
import organizerReducer from "./features/organizerSlice";
import transactionReducer from "./features/transactionSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      event: eventReducer,
      organizer: organizerReducer,
      transaction: transactionReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

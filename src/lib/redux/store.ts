import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./features/eventSlice";
import organizerReducer from "./features/organizerSlice";
// Import other reducers as needed

export function makeStore() {
  return configureStore({
    reducer: {
      event: eventReducer,
      organizer: organizerReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

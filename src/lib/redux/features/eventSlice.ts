import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEventDetails } from "@/interfaces/eventDetails";

interface IEventState {
  currentEvent: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    description: string;
    event_image: string;
    location: string;
    price: number;
    total_seats: number;
    remaining_seats: number;
    organizer_id: string;
    category: string;
  } | null;
  selectedEventId: string | null;
}

const initialState: IEventState = {
  currentEvent: null,
  selectedEventId: null,
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setCurrentEvent: (
      state,
      action: PayloadAction<IEventState["currentEvent"]>
    ) => {
      state.currentEvent = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    updateRemainingSeats: (state, action: PayloadAction<number>) => {
      if (state.currentEvent) {
        state.currentEvent.remaining_seats = action.payload;
      }
    },
    setSelectedEventId: (state, action: PayloadAction<string>) => {
      state.selectedEventId = action.payload;
    },
    clearSelectedEventId: (state) => {
      state.selectedEventId = null;
    },
  },
});

export const {
  setCurrentEvent,
  clearCurrentEvent,
  updateRemainingSeats,
  setSelectedEventId,
  clearSelectedEventId,
} = eventSlice.actions;

export default eventSlice.reducer;

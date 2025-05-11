import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrganizerState {
  selectedOrganizerId: string | null;
}

const initialState: OrganizerState = {
  selectedOrganizerId: null,
};

export const organizerSlice = createSlice({
  name: "organizer",
  initialState,
  reducers: {
    setSelectedOrganizerId: (state, action: PayloadAction<string>) => {
      state.selectedOrganizerId = action.payload;
    },
    clearSelectedOrganizerId: (state) => {
      state.selectedOrganizerId = null;
    },
  },
});

export const { setSelectedOrganizerId, clearSelectedOrganizerId } = organizerSlice.actions;

export default organizerSlice.reducer;
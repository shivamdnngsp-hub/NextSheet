import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeCell: null,
  selectionStart: null,
  selectionEnd: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    setSelectionStart(state, action) {
      state.selectionStart = action.payload;
    },

    setSelectionEnd(state, action) {
      state.selectionEnd = action.payload;
    },

    setActiveCell(state, action) {
      state.activeCell = action.payload;
    },

    clearSelection(state) {
    state.selectionStart = null;
     state.selectionEnd = null;
}
  },
});

export const { setSelectionStart, setSelectionEnd, setActiveCell, clearSelection } = selectionSlice.actions;

export default selectionSlice.reducer;
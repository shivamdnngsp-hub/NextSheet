import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeCell: null,
  editingCell: null,
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
   
    setEditingCell(state,action){
      state.editingCell = action.payload;
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

export const { setSelectionStart, setSelectionEnd, setActiveCell, clearSelection,setEditingCell } = selectionSlice.actions;

export default selectionSlice.reducer;
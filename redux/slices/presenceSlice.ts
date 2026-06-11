import { createSlice } from "@reduxjs/toolkit";

type PresentUser = {
  id: string;
  userName: string;
  color: string;
};
  const initialState = {
    presentUser : [] as PresentUser[]
  }

const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {

     setPresentUsers(state,action){
        state.presentUser = action.payload
     },
     clearPresentUser(state,action){
        state.presentUser = [];
     }
    }
})
export const {setPresentUsers,clearPresentUser} = presenceSlice.actions
export default presenceSlice.reducer;
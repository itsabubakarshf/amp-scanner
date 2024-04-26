import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {},
  },
  reducers: {
    setLoginUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const { setLoginUser } = userSlice.actions;
export default userSlice.reducer;
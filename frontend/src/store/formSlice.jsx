// Inside formSlice.js

import { createSlice } from '@reduxjs/toolkit';

export const formSlice = createSlice({
  name: 'form',
  initialState: {
    formData: {},
    responseData: [],
  },
  reducers: {
    setFormData: (state, action) => {
      state.formData = action.payload;
    },
    setResponseData: (state, action) => {
      // Here, we handle updating the state with the response data
      state.responseData = [...state.responseData, action.payload];
    },
  },
});

export const { setFormData, setResponseData } = formSlice.actions;

export default formSlice.reducer;

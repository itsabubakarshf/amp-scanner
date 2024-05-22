import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';
import userSlice from './userSlice';

export const store = configureStore({
  reducer: {
    form: formReducer,
    user: userSlice,
  },
});

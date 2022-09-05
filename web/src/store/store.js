import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import filterReducer from './slices/filterSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    filters: filterReducer
  },
});

export default store;

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import autoSaveReducer from './autoSaveSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    autoSave: autoSaveReducer,
  },
});

export default store;
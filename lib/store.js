// store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import loadingSlice from './features/loadingSlice';
import quizReducer from './features/quizSlice';
// Import other reducers for separate features/pages if needed

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingSlice,
    quiz: quizReducer,
    // Add other reducers here for separate features/pages if needed
  },
});

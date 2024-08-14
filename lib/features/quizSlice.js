// quizSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentIndex: 0,
  dataQuiz: null,
  user: null,
  live: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuizDatas(state, action) {
      state.dataQuiz = action.payload.dataQuiz;
      state.user = action.payload.user;
      state.live = action.payload.live;
    },
    setCurrentIndex(state, action) {
      state.currentIndex = action.payload;
    },
  },
});

export const { setQuizDatas, setCurrentIndex } = quizSlice.actions;

export default quizSlice.reducer;

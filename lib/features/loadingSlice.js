import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    global: false,
    specific: {},
  },
  reducers: {
    setLoading: (state, action) => {
      state.global = true;
      state.specific[action.payload] = true;
    },
    clearLoading: (state, action) => {
      state.specific[action.payload] = false;
      state.global = Object.values(state.specific).some(v => v);
    },
  },
});

export const { setLoading, clearLoading } = loadingSlice.actions;
export default loadingSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

import { reducers } from './reducers';
import { initialState } from './state';

const slice = createSlice({
  name: 'prompt',
  initialState: initialState,
  reducers: reducers,
});

export const { setPrompts } = slice.actions;

const promptSlice = slice.reducer;

export default promptSlice;

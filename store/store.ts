import { configureStore } from '@reduxjs/toolkit';

import applicationSlice from './applicationSlice/slice';
import conversationSlice from './conversationSlice/slice';
import promptSlice from './promptSlice/slice';

const store = configureStore({
  reducer: {
    application: applicationSlice,
    conversation: conversationSlice,
    prompt: promptSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;

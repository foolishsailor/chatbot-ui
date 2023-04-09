import { configureStore } from '@reduxjs/toolkit';

import applicationReducer from './applicationState/applicationState';

const store = configureStore({
  reducer: {
    application: applicationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;

import applicationReducer from './applicationState/applicationState';

import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    home: applicationReducer,
  },
});

export default store;

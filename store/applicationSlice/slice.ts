import { createSlice } from '@reduxjs/toolkit';

import { reducers } from './reducers';
import { initialState } from './state';

const slice = createSlice({
  name: 'application',
  initialState: initialState,
  reducers: reducers,
});

export const {
  setApiKey,
  setPluginKeys,
  setLoading,
  setLightMode,
  setMessageIsStreaming,
  setModelError,
  setModels,
  setPrompts,
  setShowChatbar,
  setShowPromptbar,
  setMessageError,
  setSearchTerm,
  setDefaultModelId,
  setServerSideApiKeyIsSet,
  setServerSidePluginKeysSet,
} = slice.actions;

const applicationSlice = slice.reducer;

export default applicationSlice;

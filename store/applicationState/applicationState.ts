import { createSlice } from '@reduxjs/toolkit';

import { initialState } from './initialState';
import { reducers } from './reducers';

const applicationSlice = createSlice({
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
  setFolders,
  setConversations,
  setSelectedConversation,
  setCurrentMessage,
  setPrompts,
  setShowChatbar,
  setShowPromptbar,
  setCurrentFolder,
  setMessageError,
  setSearchTerm,
  setDefaultModelId,
  setServerSideApiKeyIsSet,
  setServerSidePluginKeysSet,
} = applicationSlice.actions;

const applicationReducer = applicationSlice.reducer;

export default applicationReducer;

import { initialState } from './initialState';
import { reducers } from './reducers';

import { createSlice } from '@reduxjs/toolkit';

const applicationSlice = createSlice({
  name: 'home',
  initialState: initialState,
  reducers: reducers,
});

export const {
  setApiKey,
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

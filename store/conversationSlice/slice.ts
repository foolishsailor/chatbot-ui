import { createSlice } from '@reduxjs/toolkit';

import { reducers } from './reducers';
import { initialState } from './state';

const slice = createSlice({
  name: 'conversation',
  initialState: initialState,
  reducers: reducers,
});

export const {
  setFolders,
  setConversations,
  setSelectedConversation,
  setCurrentMessage,
  setCurrentFolder,
  updateConversation,
} = slice.actions;

const conversationSlice = slice.reducer;

export default conversationSlice;

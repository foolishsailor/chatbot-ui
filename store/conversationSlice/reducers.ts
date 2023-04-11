import { PayloadAction } from '@reduxjs/toolkit';

import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';

import { Conversation, Message } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface } from '@/types/folder';

import { ConversationState } from './state';

export const reducers = {
  setFolders(
    state: ConversationState,
    action: PayloadAction<FolderInterface[]>,
  ) {
    state.folders = action.payload;
  },
  setConversations(
    state: ConversationState,
    action: PayloadAction<{ conversations: Conversation[]; save?: boolean }>,
  ) {
    state.conversations = action.payload.conversations;
    if (action.payload.save) saveConversations(action.payload.conversations);
  },
  setSelectedConversation(
    state: ConversationState,
    action: PayloadAction<{ conversation: Conversation; save?: boolean }>,
  ) {
    state.selectedConversation = action.payload.conversation;
    if (action.payload.save) saveConversation(action.payload.conversation);
  },
  setCurrentMessage(
    state: ConversationState,
    action: PayloadAction<Message | undefined>,
  ) {
    state.currentMessage = action.payload;
  },
  setCurrentFolder(
    state: ConversationState,
    action: PayloadAction<FolderInterface | undefined>,
  ) {
    state.currentFolder = action.payload;
  },
  updateConversation(
    state: ConversationState,
    action: PayloadAction<{ conversation: Conversation; data: KeyValuePair }>,
  ) {
    const updatedConversation = {
      ...action.payload.conversation,
      [action.payload.data.key]: action.payload.data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      state.conversations,
    );

    console.log('updated messages', single, all);
    state.selectedConversation = single;
    state.conversations = all;
    // saveConversation(single);
    saveConversations(all);
  },
};

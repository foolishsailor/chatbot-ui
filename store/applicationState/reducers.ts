import { Conversation, Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';
import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import { HomeState } from './initialState';

import { PayloadAction } from '@reduxjs/toolkit';

export const reducers = {
  setApiKey(state: HomeState, action: PayloadAction<string>) {
    state.apiKey = action.payload;
  },
  setLoading(state: HomeState, action: PayloadAction<boolean>) {
    state.loading = action.payload;
  },
  setLightMode(state: HomeState, action: PayloadAction<'light' | 'dark'>) {
    state.lightMode = action.payload;
  },
  setMessageIsStreaming(state: HomeState, action: PayloadAction<boolean>) {
    state.messageIsStreaming = action.payload;
  },
  setModelError(state: HomeState, action: PayloadAction<ErrorMessage | null>) {
    state.modelError = action.payload;
  },
  setModels(state: HomeState, action: PayloadAction<OpenAIModel[]>) {
    state.models = action.payload;
  },
  setFolders(state: HomeState, action: PayloadAction<FolderInterface[]>) {
    state.folders = action.payload;
  },
  setConversations(state: HomeState, action: PayloadAction<Conversation[]>) {
    state.conversations = action.payload;
  },
  setSelectedConversation(
    state: HomeState,
    action: PayloadAction<Conversation | undefined>,
  ) {
    state.selectedConversation = action.payload;
  },
  setCurrentMessage(
    state: HomeState,
    action: PayloadAction<Message | undefined>,
  ) {
    state.currentMessage = action.payload;
  },
  setPrompts(state: HomeState, action: PayloadAction<Prompt[]>) {
    state.prompts = action.payload;
  },
  setShowChatbar(state: HomeState, action: PayloadAction<boolean>) {
    state.showChatbar = action.payload;
  },
  setShowPromptbar(state: HomeState, action: PayloadAction<boolean>) {
    state.showPromptbar = action.payload;
  },
  setCurrentFolder(
    state: HomeState,
    action: PayloadAction<FolderInterface | undefined>,
  ) {
    state.currentFolder = action.payload;
  },
  setMessageError(state: HomeState, action: PayloadAction<boolean>) {
    state.messageError = action.payload;
  },
  setSearchTerm(state: HomeState, action: PayloadAction<string>) {
    state.searchTerm = action.payload;
  },
  setDefaultModelId(
    state: HomeState,
    action: PayloadAction<OpenAIModelID | undefined>,
  ) {
    state.defaultModelId = action.payload;
  },
  setServerSideApiKeyIsSet(state: HomeState, action: PayloadAction<boolean>) {
    state.serverSideApiKeyIsSet = action.payload;
  },
  setServerSidePluginKeysSet(state: HomeState, action: PayloadAction<boolean>) {
    state.serverSidePluginKeysSet = action.payload;
  },
};

import { PayloadAction } from '@reduxjs/toolkit';

import { ErrorMessage } from '@/types/error';
import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { PluginKey } from '@/types/plugin';
import { Prompt } from '@/types/prompt';

import { ApplicationState } from './state';

export const reducers = {
  setApiKey(state: ApplicationState, action: PayloadAction<string>) {
    state.apiKey = action.payload;
  },
  setPluginKeys(state: ApplicationState, action: PayloadAction<PluginKey[]>) {
    state.pluginKeys = action.payload;
  },
  setLoading(state: ApplicationState, action: PayloadAction<boolean>) {
    state.loading = action.payload;
  },
  setLightMode(
    state: ApplicationState,
    action: PayloadAction<'light' | 'dark'>,
  ) {
    state.lightMode = action.payload;
  },
  setMessageIsStreaming(
    state: ApplicationState,
    action: PayloadAction<boolean>,
  ) {
    state.messageIsStreaming = action.payload;
  },
  setModelError(
    state: ApplicationState,
    action: PayloadAction<ErrorMessage | null>,
  ) {
    state.modelError = action.payload;
  },
  setModels(state: ApplicationState, action: PayloadAction<OpenAIModel[]>) {
    state.models = action.payload;
  },
  setPrompts(state: ApplicationState, action: PayloadAction<Prompt[]>) {
    state.prompts = action.payload;
  },
  setShowChatbar(state: ApplicationState, action: PayloadAction<boolean>) {
    state.showChatbar = action.payload;
  },
  setShowPromptbar(state: ApplicationState, action: PayloadAction<boolean>) {
    state.showPromptbar = action.payload;
  },
  setMessageError(state: ApplicationState, action: PayloadAction<boolean>) {
    state.messageError = action.payload;
  },
  setSearchTerm(state: ApplicationState, action: PayloadAction<string>) {
    state.searchTerm = action.payload;
  },
  setDefaultModelId(
    state: ApplicationState,
    action: PayloadAction<OpenAIModelID | undefined>,
  ) {
    state.defaultModelId = action.payload;
  },
  setServerSideApiKeyIsSet(
    state: ApplicationState,
    action: PayloadAction<boolean>,
  ) {
    state.serverSideApiKeyIsSet = action.payload;
  },
  setServerSidePluginKeysSet(
    state: ApplicationState,
    action: PayloadAction<boolean>,
  ) {
    state.serverSidePluginKeysSet = action.payload;
  },
};

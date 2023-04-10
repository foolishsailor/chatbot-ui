import { PayloadAction } from '@reduxjs/toolkit';

import { Prompt } from '@/types/prompt';

import { PromptState } from './state';

export const reducers = {
  setPrompts(state: PromptState, action: PayloadAction<Prompt[]>) {
    state.prompts = action.payload;
  },
};

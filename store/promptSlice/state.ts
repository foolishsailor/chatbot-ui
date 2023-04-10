import { Prompt } from '@/types/prompt';

export interface PromptState {
  prompts: Prompt[];
}

export const initialState: PromptState = {
  prompts: [],
};

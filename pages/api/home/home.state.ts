import {
  ChatFolder,
  Conversation,
  ErrorMessage,
  Message,
  OpenAIModel
} from '@/types';

export interface HomeInitialState {
  folders: ChatFolder[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  loading: boolean;
  models: OpenAIModel[];
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  showSidebar: boolean;
  apiKey: string;
  messageError: boolean
  modelError: ErrorMessage | null;
  currentMessage: Message | undefined;
}

export const initialState: HomeInitialState = {
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  loading: false,
  models: [],
  lightMode: 'light',
  messageIsStreaming: false,
  showSidebar: true,
  apiKey: '',
  messageError: false,
  modelError: null,
  currentMessage: undefined
};

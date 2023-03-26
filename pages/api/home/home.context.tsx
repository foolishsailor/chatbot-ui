import { createContext, Dispatch } from 'react';
import { ActionType } from '@/hooks';
import { HomeInitialState } from './home.state';
import { Conversation, KeyValuePair, ChatFolder } from '@/types';

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewConversation: () => void;
  handleLightMode: (mode: 'dark' | 'light') => void;
  handleCreateFolder: (name: string) => void;
  handleDeleteFolder: (folderId: number) => void;
  handleUpdateFolder: (folderId: number, name: string) => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleDeleteConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (
    conversation: Conversation,
    data: KeyValuePair,
  ) => void;
  handleApiKeyChange: (apiKey: string) => void;
  handleClearConversations: () => void;
  handleExportConversations: () => void;
  handleImportConversations: (data: {
    conversations: Conversation[];
    folders: ChatFolder[];
  }) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;

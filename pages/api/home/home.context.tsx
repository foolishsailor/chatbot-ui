import { createContext } from 'react';

import { FolderType } from '@/types/folder';

export interface HomeContextProps {
  handleNewConversation: () => void;
  handleCreateFolder: (name: string, type: FolderType) => void;
  handleDeleteFolder: (folderId: string) => void;
  handleUpdateFolder: (folderId: string, name: string) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;

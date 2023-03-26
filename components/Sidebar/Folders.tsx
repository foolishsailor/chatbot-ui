import { ChatFolder, Conversation, KeyValuePair } from '@/types';
import { useContext } from 'react';
import { Folder } from './Folder';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  conversations: Conversation[];
}

export const Folders = ({ conversations }: Props) => {
  const {
    state: { folders },
  } = useContext(HomeContext);

  return (
    <div className="flex w-full flex-col gap-1 pt-2">
      {folders.map((folder, index) => (
        <Folder
          key={index}
          conversations={conversations.filter((c) => c.folderId)}
          currentFolder={folder}
        />
      ))}
    </div>
  );
};

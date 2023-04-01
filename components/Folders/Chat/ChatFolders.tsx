import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { Folder } from '@/types/folder';
import { useContext } from 'react';
import { ChatFolder } from './ChatFolder';

import HomeContext from '@/pages/api/home/home.context';

export const Folders = () => {
  const {
    state: { folders },
  } = useContext(HomeContext);

  return (
    <div className="flex w-full flex-col pt-2">
      {folders.map((folder, index) => (
        <ChatFolder key={index} />
      ))}
    </div>
  );
};

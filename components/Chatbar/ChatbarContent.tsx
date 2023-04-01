import { Conversation } from '@/types/chat';
import { useEffect, useState, useContext } from 'react';

import { Folders } from '../Folders/Chat/ChatFolders';
import { Conversations } from './Conversations';

import HomeContext from '@/pages/api/home/home.context';

const ChatbarContent = () => {
  const {
    state: { conversations, searchTerm },
  } = useContext(HomeContext);

  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(conversations);

  useEffect(() => {
    if (searchTerm) {
      setFilteredConversations(
        conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            ' ' +
            conversation.messages.map((message) => message.content).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  return (
    <div className="flex-grow overflow-auto">
      <Folders />
      <Conversations
        conversations={filteredConversations.filter(
          (conversation) => !conversation.folderId,
        )}
      />
    </div>
  );
};

export default ChatbarContent;

import { Conversation } from '@/types/chat';
import { useEffect, useState, useContext } from 'react';

import { IconMessagesOff } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { Folders } from '../Folders/Chat/ChatFolders';

import { ChatbarSettings } from './ChatbarSettings';
import { Conversations } from './Conversations';
import ChatbarHeader from './ChatBarHeader';

import HomeContext from '@/pages/api/home/home.context';

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const {
    state: { folders, conversations, searchTerm },
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
    <div
      className={`fixed top-0 bottom-0 z-50 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <ChatbarHeader />

      <div className="flex-grow overflow-auto">
        {folders.length > 0 && (
          <div className="flex border-b border-white/20 pb-2">
            <Folders />
          </div>
        )}

        {conversations.length > 0 ? (
          <Conversations
            conversations={filteredConversations.filter(
              (conversation) => !conversation.folderId,
            )}
          />
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3 text-sm leading-normal text-white opacity-50">
            <IconMessagesOff />
            {t('No conversations.')}
          </div>
        )}
      </div>
      <ChatbarSettings />
    </div>
  );
};

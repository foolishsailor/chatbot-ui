import { useEffect, useState, useContext } from 'react';
import { ChatFolder, Conversation, KeyValuePair } from '@/types';
import {
  IconArrowBarLeft,
  IconFolderPlus,
  IconMessagesOff,
  IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { Conversations } from './Conversations';
import { Folders } from './Folders';
import { Search } from './Search';
import { SidebarSettings } from './SidebarSettings';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  onToggleSidebar: () => void;
}

export const Sidebar = ({ onToggleSidebar }: Props) => {
  const { t } = useTranslation('sidebar');

  const {
    state: { folders, conversations, searchTerm },
    dispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(conversations);

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 });

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

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
    <aside
      className={`fixed top-0 bottom-0 z-50 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <header className="flex items-center">
        <button
          className="flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={() => {
            handleNewConversation();

            dispatch({ type: 'change', field: 'searchTerm', value: '' });
          }}
        >
          <IconPlus size={18} />
          {t('New chat')}
        </button>

        <button
          className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-[12.5px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={() => handleCreateFolder(t('New folder'))}
        >
          <IconFolderPlus size={18} />
        </button>

        <IconArrowBarLeft
          className="ml-1 hidden cursor-pointer p-1 text-neutral-300 hover:text-neutral-400 sm:flex"
          size={32}
          onClick={onToggleSidebar}
        />
      </header>

      {conversations.length > 1 && (
        <Search
          searchTerm={searchTerm}
          onSearch={(value: string) =>
            dispatch({ type: 'change', field: 'searchTerm', value })
          }
        />
      )}

      <div className="flex-grow overflow-auto">
        {folders.length > 0 && (
          <div className="flex border-b border-white/20 pb-2">
            <Folders
              conversations={filteredConversations.filter(
                (conversation) => conversation.folderId !== 0,
              )}
            />
          </div>
        )}

        {conversations.length > 0 ? (
          <div
            className="h-full pt-2"
            onDrop={(e) => handleDrop(e)}
            onDragOver={allowDrop}
            onDragEnter={highlightDrop}
            onDragLeave={removeHighlight}
          >
            <Conversations
              conversations={filteredConversations.filter(
                (conversation) =>
                  conversation.folderId === 0 ||
                  !folders[conversation.folderId - 1],
              )}
            />
          </div>
        ) : (
          <div className="mt-8 select-none text-center text-white opacity-50">
            <IconMessagesOff className="mx-auto mb-3" />
            <span className="text-[12.5px] leading-3">
              {t('No conversations.')}
            </span>
          </div>
        )}
      </div>

      <SidebarSettings />
    </aside>
  );
};

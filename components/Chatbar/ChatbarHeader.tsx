import { useContext } from 'react';
import {
  IconArrowBarLeft,
  IconFolderPlus,
  IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { Search } from '../Sidebar/Search';
import HomeContext from '@/pages/api/home/home.context';

const ChatbarHeader = () => {
  const { t } = useTranslation('sidebar');

  const {
    state: { showSidebar, conversations, searchTerm },
    dispatch,
    handleCreateFolder,
    handleNewConversation,
  } = useContext(HomeContext);

  const handleToggleSidebar = () =>
    dispatch({
      type: 'change',
      field: 'showSidebar',
      value: !showSidebar,
    });

  return (
    <>
      <div className="flex items-center">
        <button
          className="flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-[14px] leading-normal text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={() => {
            handleNewConversation();

            dispatch({ type: 'change', field: 'searchTerm', value: '' });
          }}
        >
          <IconPlus size={18} />
          {t('New chat')}
        </button>

        <button
          className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-[14px] leading-normal text-white transition-colors duration-200 hover:bg-gray-500/10"
          onClick={() => handleCreateFolder(t('New folder'), 'chat')}
        >
          <IconFolderPlus size={18} />
        </button>

        <IconArrowBarLeft
          className="ml-1 hidden cursor-pointer p-1 text-neutral-300 hover:text-neutral-400 sm:flex"
          size={32}
          onClick={handleToggleSidebar}
        />
      </div>
      {conversations.length > 1 && (
        <Search
          placeholder="Search conversations..."
          searchTerm={searchTerm}
          onSearch={(value: string) =>
            dispatch({ type: 'change', field: 'searchTerm', value })
          }
        />
      )}
    </>
  );
};

export default ChatbarHeader;

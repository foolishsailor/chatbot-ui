import { Conversation } from '@/types/chat';
import { useContext } from 'react';

import { IconPlus } from '@tabler/icons-react';
import HomeContext from '@/pages/api/home/home.context';

export const Navbar = () => {
  const {
    state: { selectedConversation },
    handleNewConversation,
  } = useContext(HomeContext);

  return (
    <nav className="flex w-full justify-between bg-[#202123] py-3 px-4">
      <div className="mr-4"></div>

      <div className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
        {selectedConversation?.name}
      </div>

      <IconPlus
        className="mr-8 cursor-pointer hover:text-neutral-400"
        onClick={handleNewConversation}
      />
    </nav>
  );
};

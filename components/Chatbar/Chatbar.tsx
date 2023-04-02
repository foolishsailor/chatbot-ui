import { useTranslation } from 'next-i18next';

import { ChatbarSettings } from './ChatbarSettings';
import ChatbarHeader from './ChatbarHeader';
import ChatbarContent from './ChatbarContent';

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  return (
    <div
      className={`fixed top-0 bottom-0 z-50 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <ChatbarHeader />
      <ChatbarContent />
      <ChatbarSettings />
    </div>
  );
};

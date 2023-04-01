import { useContext } from 'react';
import { useTranslation } from 'next-i18next';
import { IconMessagesOff } from '@tabler/icons-react';
import { Conversation } from '@/types/chat';
import { ConversationComponent } from './Conversation';
import HomeContext from '@/pages/api/home/home.context';

interface Props {
  conversations: Conversation[];
}

const allowDrop = (e: any) => {
  e.preventDefault();
};

const highlightDrop = (e: any) => {
  e.target.style.background = '#343541';
};

const removeHighlight = (e: any) => {
  e.target.style.background = 'none';
};

export const Conversations = ({ conversations }: Props) => {
  const { t } = useTranslation('sidebar');
  const { handleUpdateConversation } = useContext(HomeContext);

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 });

      e.target.style.background = 'none';
    }
  };

  return conversations.length > 0 ? (
    <div
      className="h-full pt-2"
      onDrop={(e) => handleDrop(e)}
      onDragOver={allowDrop}
      onDragEnter={highlightDrop}
      onDragLeave={removeHighlight}
    >
      <div className="flex w-full flex-col gap-1">
        {conversations
          .slice()
          .reverse()
          .map((conversation, index) => (
            <ConversationComponent key={index} conversation={conversation} />
          ))}
      </div>
    </div>
  ) : (
    <div className="mt-8 flex flex-col items-center gap-3 text-sm leading-normal text-white opacity-50">
      <IconMessagesOff />
      {t('No conversations.')}
    </div>
  );
};

import { useContext } from 'react';
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
  const { handleUpdateConversation } = useContext(HomeContext);

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 });

      e.target.style.background = 'none';
    }
  };

  return (
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
  );
};

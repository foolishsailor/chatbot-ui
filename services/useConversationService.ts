import { Conversation } from '@/types/chat';

const useConversationService = () => {
  return {
    saveConversation: (conversation: Conversation) => {},
    updateConversation: (id: string, conversation: Partial<Conversation>) => {},
    deleteConversation: (id: string) => {},
    getConversation: (id: string) => {},
    getConversations: () => {},
  };
};

export default useConversationService;

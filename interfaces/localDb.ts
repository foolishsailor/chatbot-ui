import { Conversation } from '@/types/chat';

const local = () => {
  return {
    saveConversation: (conversation: Conversation) => {
      const conversationHistory = localStorage.getItem('conversationHistory');

      if (conversationHistory) {
        const conversations = JSON.parse(conversationHistory);

        const index = conversations.findIndex(
          (c: Conversation) => c.folderId === conversation.folderId,
        );

        if (index === -1) {
          localStorage.setItem(
            'conversationHistory',
            JSON.stringify([...conversations, conversation]),
          );
        } else {
          conversations[index] = conversation;
          localStorage.setItem(
            'conversationHistory',
            JSON.stringify(conversations),
          );
        }
      }
    },
  };
};

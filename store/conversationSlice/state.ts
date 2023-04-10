import { Conversation, Message } from '@/types/chat';
import { FolderInterface } from '@/types/folder';

export interface ConversationState {
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  currentFolder: FolderInterface | undefined;
}

export const initialState: ConversationState = {
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  currentFolder: undefined,
};

import { useCallback, useContext, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';

import { RootState } from '@/store';
import {
  setApiKey,
  setPluginKeys,
  setPrompts,
  setShowChatbar,
} from '@/store/applicationSlice';
import {
  setConversations,
  setFolders,
  setSelectedConversation,
  updateConversation,
} from '@/store/conversationSlice';

import { Conversation } from '@/types/chat';
import { LatestExportFormat, SupportedExportFormats } from '@/types/export';
import { OpenAIModels } from '@/types/openai';
import { PluginKey } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

import { ChatFolders } from './components/ChatFolders';
import { ChatbarSettings } from './components/ChatbarSettings';
import { Conversations } from './components/Conversations';

import Sidebar from '../Sidebar';
import ChatbarContext from './Chatbar.context';
import { ChatbarInitialState, initialState } from './Chatbar.state';

import { v4 as uuidv4 } from 'uuid';

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const dispatch = useDispatch();

  const { conversations, showChatbar, defaultModelId, folders, pluginKeys } =
    useSelector(
      (state: RootState) => ({
        conversations: state.conversation.conversations,
        showChatbar: state.application.showChatbar,
        defaultModelId: state.application.defaultModelId,
        folders: state.conversation.folders,
        pluginKeys: state.application.pluginKeys,
      }),
      shallowEqual,
    );

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const { handleCreateFolder, handleNewConversation } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      dispatch(setApiKey(apiKey));

      localStorage.setItem('apiKey', apiKey);
    },
    [dispatch],
  );

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey;
        }

        return key;
      });

      dispatch(setPluginKeys(updatedPluginKeys));

      localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
    } else {
      dispatch(setPluginKeys([...pluginKeys, pluginKey]));

      localStorage.setItem(
        'pluginKeys',
        JSON.stringify([...pluginKeys, pluginKey]),
      );
    }
  };

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    const updatedPluginKeys = pluginKeys.filter(
      (key) => key.pluginId !== pluginKey.pluginId,
    );

    if (updatedPluginKeys.length === 0) {
      dispatch(setPluginKeys([]));

      localStorage.removeItem('pluginKeys');
      return;
    }

    dispatch(setPluginKeys(updatedPluginKeys));

    localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = importData(data);
    dispatch(setConversations({ conversations: history }));
    dispatch(
      setSelectedConversation({ conversation: history[history.length - 1] }),
    );
    dispatch(setFolders(folders));
    dispatch(setPrompts(prompts));
  };

  const handleClearConversations = () => {
    defaultModelId &&
      dispatch(
        setSelectedConversation({
          conversation: {
            id: uuidv4(),
            name: 'New conversation',
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            folderId: null,
          },
        }),
      );

    dispatch(setConversations({ conversations: [] }));

    localStorage.removeItem('conversationHistory');
    localStorage.removeItem('selectedConversation');

    const updatedFolders = folders.filter((f) => f.type !== 'chat');

    dispatch(setFolders(updatedFolders));

    saveFolders(updatedFolders);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    );

    dispatch(
      setConversations({ conversations: updatedConversations, save: true }),
    );

    chatDispatch({ field: 'searchTerm', value: '' });

    if (updatedConversations.length > 0) {
      dispatch(
        setSelectedConversation({
          conversation: updatedConversations[updatedConversations.length - 1],
          save: true,
        }),
      );
    } else {
      defaultModelId &&
        dispatch(
          setSelectedConversation({
            conversation: {
              id: uuidv4(),
              name: 'New conversation',
              messages: [],
              model: OpenAIModels[defaultModelId],
              prompt: DEFAULT_SYSTEM_PROMPT,
              folderId: null,
            },
          }),
        );

      localStorage.removeItem('selectedConversation');
    }
  };

  const handleToggleChatbar = () => {
    dispatch(setShowChatbar(!showChatbar));

    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));

      dispatch(
        updateConversation({
          conversation,
          data: { key: 'folderId', value: 0 },
        }),
      );
      chatDispatch({ field: 'searchTerm', value: '' });
      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            ' ' +
            conversation.messages.map((message) => message.content).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations,
      });
    }
  }, [searchTerm, conversations]);

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportData,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Conversation>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Conversations conversations={filteredConversations} />}
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'chat')}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};

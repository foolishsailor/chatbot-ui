import { Chat } from '@/components/Chat/Chat';
import { Navbar } from '@/components/Mobile/Navbar';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import {
  ChatBody,
  ChatFolder,
  Conversation,
  ErrorMessage,
  KeyValuePair,
  Message,
  OpenAIModelID,
  OpenAIModels
} from '@/types';
import {
  cleanConversationHistory,
  cleanSelectedConversation
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { HomeInitialState, initialState } from './home.state';
import { useCreateReducer } from '@/hooks';

interface HomeProps {
  serverSideApiKeyIsSet: boolean;
}

const Home = ({ serverSideApiKeyIsSet }: HomeProps) => {
  const { t } = useTranslation('chat');

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState
  });

  const {
    state: {
      folders,
      conversations,
      selectedConversation,
      loading,
      models,
      lightMode,
      messageIsStreaming,
      showSidebar,
      apiKey,
      messageError,
      modelError,
      currentMessage
    },
    dispatch
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const handleSend = async (message: Message, deleteCount = 0) => {
    if (selectedConversation) {
      let updatedConversation: Conversation;

      if (deleteCount) {
        const updatedMessages = [...selectedConversation.messages];
        for (let i = 0; i < deleteCount; i++) {
          updatedMessages.pop();
        }

        updatedConversation = {
          ...selectedConversation,
          messages: [...updatedMessages, message]
        };
      } else {
        updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, message]
        };
      }

      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: updatedConversation
      });
      dispatch({ type: 'change', field: 'loading', value: true });
      dispatch({ type: 'change', field: 'messageIsStreaming', value: true });
      dispatch({ type: 'change', field: 'messageError', value: false });

      const chatBody: ChatBody = {
        model: updatedConversation.model,
        messages: updatedConversation.messages,
        key: apiKey,
        prompt: updatedConversation.prompt
      };

      const controller = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify(chatBody)
      });

      if (!response.ok) {
        dispatch({ type: 'change', field: 'loading', value: false });
        dispatch({ type: 'change', field: 'messageIsStreaming', value: false });
        dispatch({ type: 'change', field: 'messageError', value: true });

        return;
      }

      const data = response.body;

      if (!data) {
        dispatch({ type: 'change', field: 'loading', value: false });
        dispatch({ type: 'change', field: 'messageIsStreaming', value: false });
        dispatch({ type: 'change', field: 'messageError', value: true });

        return;
      }

      if (updatedConversation.messages.length === 1) {
        const { content } = message;
        const customName =
          content.length > 30 ? content.substring(0, 30) + '...' : content;

        updatedConversation = {
          ...updatedConversation,
          name: customName
        };
      }

      dispatch({ type: 'change', field: 'loading', value: false });

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirst = true;
      let text = '';

      while (!done) {
        if (stopConversationRef.current === true) {
          controller.abort();
          break;
        }
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        text += chunkValue;

        if (isFirst) {
          isFirst = false;
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: chunkValue }
          ];

          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages
          };

          dispatch({
            type: 'change',
            field: 'selectedConversation',
            value: updatedConversation
          });
        } else {
          const updatedMessages: Message[] = updatedConversation.messages.map(
            (message, index) => {
              if (index === updatedConversation.messages.length - 1) {
                return {
                  ...message,
                  content: text
                };
              }

              return message;
            }
          );

          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages
          };

          dispatch({
            type: 'change',
            field: 'selectedConversation',
            value: updatedConversation
          });
        }
      }

      saveConversation(updatedConversation);

      const updatedConversations: Conversation[] = conversations.map(
        (conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation;
          }

          return conversation;
        }
      );

      if (updatedConversations.length === 0) {
        updatedConversations.push(updatedConversation);
      }

      dispatch({
        type: 'change',
        field: 'conversations',
        value: updatedConversations
      });

      saveConversations(updatedConversations);

      dispatch({ type: 'change', field: 'messageIsStreaming', value: false });
    }
  };

  const fetchModels = async (key: string) => {
    const error = {
      title: t('Error fetching models.'),
      code: null,
      messageLines: [
        t(
          'Make sure your OpenAI API key is set in the bottom left of the sidebar.'
        ),
        t('If you completed this step, OpenAI may be experiencing issues.')
      ]
    } as ErrorMessage;

    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key
      })
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        Object.assign(error, {
          code: data.error?.code,
          messageLines: [data.error?.message]
        });
      } catch (e) {}

      dispatch({ type: 'change', field: 'modelError', value: error });

      return;
    }

    const data = await response.json();

    if (!data) {
      dispatch({ type: 'change', field: 'modelError', value: error });

      return;
    }

    dispatch({ type: 'change', field: 'models', value: data });
    dispatch({ type: 'change', field: 'modelError', value: null });
  };

  const handleLightMode = (mode: 'dark' | 'light') => {
    dispatch({ type: 'change', field: 'lightMode', value: mode });
    localStorage.setItem('theme', mode);
  };

  const handleApiKeyChange = (apiKey: string) => {
    dispatch({ type: 'change', field: 'apiKey', value: apiKey });

    localStorage.setItem('apiKey', apiKey);
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: {
    conversations: Conversation[];
    folders: ChatFolder[];
  }) => {
    importData(data.conversations, data.folders);

    dispatch({
      type: 'change',
      field: 'conversations',
      value: data.conversations
    });
    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: data.conversations[data.conversations.length - 1]
    });
    dispatch({ type: 'change', field: 'folders', value: data.folders });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: conversation
    });

    saveConversation(conversation);
  };

  const handleCreateFolder = (name: string) => {
    const lastFolder = folders[folders.length - 1];

    const newFolder: ChatFolder = {
      id: lastFolder ? lastFolder.id + 1 : 1,
      name
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ type: 'change', field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: number) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);

    dispatch({ type: 'change', field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: 0
        };
      }

      return c;
    });

    dispatch({
      type: 'change',
      field: 'conversations',
      value: updatedConversations
    });

    saveConversations(updatedConversations);
  };

  const handleUpdateFolder = (folderId: number, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name
        };
      }

      return f;
    });

    dispatch({ type: 'change', field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: lastConversation ? lastConversation.id + 1 : 1,
      name: `${t('Conversation')} ${
        lastConversation ? lastConversation.id + 1 : 1
      }`,
      messages: [],
      model: OpenAIModels[OpenAIModelID.GPT_3_5],
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: 0
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({
      type: 'change',
      field: 'conversations',
      value: updatedConversations
    });
    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: newConversation
    });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ type: 'change', field: 'loading', value: false });
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id
    );

    dispatch({
      type: 'change',
      field: 'conversations',
      value: updatedConversations
    });

    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: updatedConversations[updatedConversations.length - 1]
      });
      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: {
          id: 1,
          name: 'New conversation',
          messages: [],
          model: OpenAIModels[OpenAIModelID.GPT_3_5],
          prompt: DEFAULT_SYSTEM_PROMPT,
          folderId: 0
        }
      });

      localStorage.removeItem('selectedConversation');
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations
    );

    dispatch({ type: 'change', field: 'conversations', value: all });
    dispatch({ type: 'change', field: 'selectedConversation', value: single });
  };

  const handleClearConversations = () => {
    dispatch({ type: 'change', field: 'conversations', value: [] });
    localStorage.removeItem('conversationHistory');

    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: {
        id: 1,
        name: 'New conversation',
        messages: [],
        model: OpenAIModels[OpenAIModelID.GPT_3_5],
        prompt: DEFAULT_SYSTEM_PROMPT,
        folderId: 0
      }
    });

    localStorage.removeItem('selectedConversation');

    dispatch({ type: 'change', field: 'folders', value: [] });

    localStorage.removeItem('folders');
  };

  const handleEditMessage = (message: Message, messageIndex: number) => {
    if (selectedConversation) {
      const updatedMessages = selectedConversation.messages
        .map((m, i) => {
          if (i < messageIndex) {
            return m;
          }
        })
        .filter((m) => m) as Message[];

      const updatedConversation = {
        ...selectedConversation,
        messages: updatedMessages
      };

      const { single, all } = updateConversation(
        updatedConversation,
        conversations
      );

      dispatch({ type: 'change', field: 'conversations', value: all });
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: single
      });
      dispatch({ type: 'change', field: 'currentMessage', value: message });
    }
  };

  useEffect(() => {
    if (currentMessage) {
      handleSend(currentMessage);
      dispatch({ type: 'change', field: 'currentMessage', value: undefined });
    }
  }, [currentMessage]);

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ type: 'change', field: 'showSidebar', value: false });
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (apiKey) {
      fetchModels(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      dispatch({
        type: 'change',
        field: 'lightMode',
        value: theme as 'dark' | 'light'
      });
    }

    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      dispatch({ type: 'change', field: 'apiKey', value: apiKey });

      fetchModels(apiKey);
    } else if (serverSideApiKeyIsSet) {
      fetchModels('');
    }

    if (window.innerWidth < 640) {
      dispatch({ type: 'change', field: 'showSidebar', value: false });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({
        type: 'change',
        field: 'folders',
        value: JSON.parse(folders)
      });
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory
      );

      dispatch({
        type: 'change',
        field: 'conversations',
        value: cleanedConversationHistory
      });
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation
      );

      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: cleanedSelectedConversation
      });
    } else {
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: {
          id: 1,
          name: 'New conversation',
          messages: [],
          model: OpenAIModels[OpenAIModelID.GPT_3_5],
          prompt: DEFAULT_SYSTEM_PROMPT,
          folderId: 0
        }
      });
    }
  }, [serverSideApiKeyIsSet]);

  return (
    <>
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <main
          className={`flex flex-col h-screen w-screen text-white dark:text-white text-sm ${lightMode}`}
        >
          <div className="sm:hidden w-full fixed top-0">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            {showSidebar ? (
              <div>
                <Sidebar
                  loading={messageIsStreaming}
                  conversations={conversations}
                  lightMode={lightMode}
                  selectedConversation={selectedConversation}
                  apiKey={apiKey}
                  folders={folders}
                  onToggleLightMode={handleLightMode}
                  onCreateFolder={handleCreateFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onUpdateFolder={handleUpdateFolder}
                  onNewConversation={handleNewConversation}
                  onSelectConversation={handleSelectConversation}
                  onDeleteConversation={handleDeleteConversation}
                  onToggleSidebar={() =>
                    dispatch({
                      type: 'change',
                      field: 'showSidebar',
                      value: !showSidebar
                    })
                  }
                  onUpdateConversation={handleUpdateConversation}
                  onApiKeyChange={handleApiKeyChange}
                  onClearConversations={handleClearConversations}
                  onExportConversations={handleExportData}
                  onImportConversations={handleImportConversations}
                />

                <IconArrowBarLeft
                  className="z-50 fixed top-5 left-[270px] sm:top-0.5 sm:left-[270px] sm:text-neutral-700 dark:text-white cursor-pointer hover:text-gray-400 dark:hover:text-gray-300 h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() =>
                    dispatch({
                      type: 'change',
                      field: 'showSidebar',
                      value: !showSidebar
                    })
                  }
                />

                <div
                  onClick={() =>
                    dispatch({
                      type: 'change',
                      field: 'showSidebar',
                      value: !showSidebar
                    })
                  }
                  className="sm:hidden bg-black opacity-70 z-10 absolute top-0 left-0 h-full w-full"
                ></div>
              </div>
            ) : (
              <IconArrowBarRight
                className="fixed text-white z-50 top-2.5 left-4 sm:top-0.5 sm:left-4 sm:text-neutral-700 dark:text-white cursor-pointer hover:text-gray-400 dark:hover:text-gray-300 h-7 w-7 sm:h-8 sm:w-8"
                onClick={() =>
                  dispatch({
                    type: 'change',
                    field: 'showSidebar',
                    value: !showSidebar
                  })
                }
              />
            )}

            <Chat
              conversation={selectedConversation}
              messageIsStreaming={messageIsStreaming}
              apiKey={apiKey}
              serverSideApiKeyIsSet={serverSideApiKeyIsSet}
              modelError={modelError}
              messageError={messageError}
              models={models}
              loading={loading}
                      onSend={handleSend}
              onUpdateConversation={handleUpdateConversation}
              onEditMessage={handleEditMessage}
              stopConversationRef={stopConversationRef}
            />
          </div>
        </main>
      )}
    </>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown'
      ]))
    }
  };
};

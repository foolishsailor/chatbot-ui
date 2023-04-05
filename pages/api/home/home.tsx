import { Chat } from '@/components/Chat/Chat';
import { Navbar } from '@/components/Mobile/Navbar';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { ChatBody, Conversation, Message } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { ErrorMessage } from '@/types/error';
import { LatestExportFormat, SupportedExportFormats } from '@/types/export';
import { Folder, FolderType } from '@/types/folder';
import {
  fallbackModelID,
  OpenAIModel,
  OpenAIModelID,
  OpenAIModels,
} from '@/types/openai';
import { Prompt } from '@/types/prompt';
import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';
import { savePrompts } from '@/utils/app/prompts';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { HomeInitialState, initialState } from './home.state';
import { Promptbar } from '@/components/Promptbar/Promptbar';
import HomeContext from './home.context';
import { useCreateReducer } from '@/hooks';
import { v4 as uuidv4 } from 'uuid';

interface HomeProps {
  serverSideApiKeyIsSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({ serverSideApiKeyIsSet, defaultModelId }: HomeProps) => {
  const { t } = useTranslation('chat');

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      folders,
      prompts,
      conversations,
      selectedConversation,
      loading,
      models,
      lightMode,
      messageIsStreaming,
      showSidebar,
      showPromptbar,
      apiKey,
      messageError,
      modelError,
      currentMessage,
    },
    dispatch,
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
          messages: [...updatedMessages, message],
        };
      } else {
        updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, message],
        };
      }

      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: updatedConversation,
      });
      dispatch({ type: 'change', field: 'loading', value: true });
      dispatch({ type: 'change', field: 'messageIsStreaming', value: true });

      const chatBody: ChatBody = {
        model: updatedConversation.model,
        messages: updatedConversation.messages,
        key: apiKey,
        prompt: updatedConversation.prompt,
      };

      const controller = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(chatBody),
      });

      if (!response.ok) {
        dispatch({ type: 'change', field: 'loading', value: false });
        dispatch({ type: 'change', field: 'messageIsStreaming', value: false });

        return;
      }

      const data = response.body;

      if (!data) {
        dispatch({ type: 'change', field: 'loading', value: false });
        dispatch({ type: 'change', field: 'messageIsStreaming', value: false });

        return;
      }

      if (updatedConversation.messages.length === 1) {
        const { content } = message;
        const customName =
          content.length > 30 ? content.substring(0, 30) + '...' : content;

        updatedConversation = {
          ...updatedConversation,
          name: customName,
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
          done = true;
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
            { role: 'assistant', content: chunkValue },
          ];

          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };

          dispatch({
            type: 'change',
            field: 'selectedConversation',
            value: updatedConversation,
          });
        } else {
          const updatedMessages: Message[] = updatedConversation.messages.map(
            (message, index) => {
              if (index === updatedConversation.messages.length - 1) {
                return {
                  ...message,
                  content: text,
                };
              }

              return message;
            },
          );

          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };

          dispatch({
            type: 'change',
            field: 'selectedConversation',
            value: updatedConversation,
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
        },
      );

      if (updatedConversations.length === 0) {
        updatedConversations.push(updatedConversation);
      }

      dispatch({
        type: 'change',
        field: 'conversations',
        value: updatedConversations,
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
          'Make sure your OpenAI API key is set in the bottom left of the sidebar.',
        ),
        t('If you completed this step, OpenAI may be experiencing issues.'),
      ],
    } as ErrorMessage;

    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
      }),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        Object.assign(error, {
          code: data.error?.code,
          messageLines: [data.error?.message],
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

  const handleToggleChatbar = () => {
    dispatch({ type: 'change', field: 'showSidebar', value: !showSidebar });
    localStorage.setItem('showChatbar', JSON.stringify(!showSidebar));
  };

  const handleTogglePromptbar = () => {
    dispatch({ type: 'change', field: 'showPromptbar', value: !showPromptbar });
    localStorage.setItem('showPromptbar', JSON.stringify(!showPromptbar));
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders }: LatestExportFormat = importData(data);

    dispatch({
      type: 'change',
      field: 'conversations',
      value: history,
    });
    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: history[history.length - 1],
    });
    dispatch({ type: 'change', field: 'folders', value: folders });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ type: 'change', field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);

    dispatch({ type: 'change', field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({
      type: 'change',
      field: 'conversations',
      value: updatedConversations,
    });

    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({
      type: 'change',
      field: 'prompts',
      value: updatedPrompts,
    });

    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
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
      id: uuidv4(),
      name: `${t('Conversation')} ${
        lastConversation ? lastConversation.id + 1 : 1
      }`,
      messages: [],
      model: OpenAIModels[OpenAIModelID.GPT_3_5],
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({
      type: 'change',
      field: 'conversations',
      value: updatedConversations,
    });
    dispatch({
      type: 'change',
      field: 'selectedConversation',
      value: newConversation,
    });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ type: 'change', field: 'loading', value: false });
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    );

    dispatch({
      type: 'change',
      field: 'conversations',
      value: updatedConversations,
    });

    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: updatedConversations[updatedConversations.length - 1],
      });
      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: 'New conversation',
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          folderId: null,
        },
      });

      localStorage.removeItem('selectedConversation');
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
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
        id: uuidv4(),
        name: 'New conversation',
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        folderId: null,
      },
    });

    localStorage.removeItem('selectedConversation');

    const updatedFolders = folders.filter((f) => f.type !== 'chat');

    dispatch({ type: 'change', field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
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
        messages: updatedMessages,
      };

      const { single, all } = updateConversation(
        updatedConversation,
        conversations,
      );

      dispatch({ type: 'change', field: 'conversations', value: all });
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: single,
      });
      dispatch({ type: 'change', field: 'currentMessage', value: message });
    }
  };

  const handleCreatePrompt = () => {
    const lastPrompt = prompts[prompts.length - 1];

    const newPrompt: Prompt = {
      id: uuidv4(),
      name: `Prompt ${prompts.length + 1}`,
      description: '',
      content: '',
      model: OpenAIModels[defaultModelId],
      folderId: null,
    };

    const updatedPrompts = [...prompts, newPrompt];

    dispatch({ type: 'change', field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdatePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.map((p) => {
      if (p.id === prompt.id) {
        return prompt;
      }

      return p;
    });

    dispatch({ type: 'change', field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);
    dispatch({ type: 'change', field: 'prompts', value: updatedPrompts });

    savePrompts(updatedPrompts);
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
    dispatch({
      type: 'change',
      field: 'defaultModelId',
      value: defaultModelId,
    });
  }, [defaultModelId]);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      dispatch({
        type: 'change',
        field: 'lightMode',
        value: theme as 'dark' | 'light',
      });
    }

    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      dispatch({ type: 'change', field: 'apiKey', value: apiKey });

      fetchModels(apiKey);
    } else if (serverSideApiKeyIsSet) {
      dispatch({ type: 'change', field: 'serverSideApiKeyIsSet', value: true });
      fetchModels('');
    }

    if (window.innerWidth < 640) {
      dispatch({ type: 'change', field: 'showSidebar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ type: 'change', field: 'showSidebar', value: true });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ type: 'change', field: 'showPromptbar', value: true });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({
        type: 'change',
        field: 'folders',
        value: JSON.parse(folders),
      });
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({
        type: 'change',
        field: 'prompts',
        value: JSON.parse(prompts),
      });
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      dispatch({
        type: 'change',
        field: 'conversations',
        value: cleanedConversationHistory,
      });
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {
      dispatch({
        type: 'change',
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: 'New conversation',
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          folderId: null,
        },
      });
    }
  }, [serverSideApiKeyIsSet]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleLightMode,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleDeleteConversation,
        handleUpdateConversation,
        handleApiKeyChange,
        handleClearConversations,
        handleExportData,
        handleImportConversations,
        handleSend,
      }}
    >
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            {showSidebar ? (
              <div>
                <Chatbar />

                <button
                  className="fixed top-5 left-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
                  onClick={handleToggleChatbar}
                >
                  <IconArrowBarLeft />
                </button>

                <div
                  onClick={handleToggleChatbar}
                  className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
                ></div>
              </div>
            ) : (
              <button
                className="fixed top-2.5 left-4 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-4 sm:h-8 sm:w-8 sm:text-neutral-700"
                onClick={handleToggleChatbar}
              >
                <IconArrowBarRight />
              </button>
            )}
            <div className="flex flex-1">
              <Chat />
            </div>
            {showPromptbar ? (
              <div>
                <Promptbar
                  prompts={prompts}
                  folders={folders.filter((folder) => folder.type === 'prompt')}
                  onCreatePrompt={handleCreatePrompt}
                  onUpdatePrompt={handleUpdatePrompt}
                  onDeletePrompt={handleDeletePrompt}
                  onCreateFolder={(name) => handleCreateFolder(name, 'prompt')}
                  onDeleteFolder={handleDeleteFolder}
                  onUpdateFolder={handleUpdateFolder}
                />
                <button
                  className="fixed top-5 right-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
                  onClick={handleTogglePromptbar}
                >
                  <IconArrowBarRight />
                </button>
                <div
                  onClick={handleTogglePromptbar}
                  className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
                ></div>
              </div>
            ) : (
              <button
                className="fixed top-2.5 right-4 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-4 sm:h-8 sm:w-8 sm:text-neutral-700"
                onClick={handleTogglePromptbar}
              >
                <IconArrowBarLeft />
              </button>
            )}
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
      ])),
    },
  };
};

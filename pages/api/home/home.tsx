import { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';

import { RootState } from '@/store';
import {
  setApiKey,
  setDefaultModelId,
  setLightMode,
  setLoading,
  setModelError,
  setModels,
  setPluginKeys,
  setPrompts,
  setServerSideApiKeyIsSet,
  setServerSidePluginKeysSet,
  setShowChatbar,
  setShowPromptbar,
} from '@/store/applicationSlice';
import {
  setConversations,
  setFolders,
  setSelectedConversation,
} from '@/store/conversationSlice';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { PluginKey } from '@/types/plugin';
import { Prompt } from '@/types/prompt';

import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import Promptbar from '@/components/Promptbar';

import HomeContext from './home.context';

import { v4 as uuidv4 } from 'uuid';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const dispatch = useDispatch();

  const {
    apiKey,
    lightMode,
    folders,
    conversations,
    selectedConversation,
    prompts,
  } = useSelector(
    (state: RootState) => ({
      apiKey: state.application.apiKey,
      lightMode: state.application.lightMode,
      folders: state.conversation.folders,
      conversations: state.conversation.conversations,
      selectedConversation: state.conversation.selectedConversation,
      prompts: state.application.prompts,
    }),
    shallowEqual,
  );

  const stopConversationRef = useRef<boolean>(false);

  const { data, error } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
  );

  useEffect(() => {
    if (data) dispatch(setModels(data));
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(setModelError(getModelsError(error)));
  }, [dispatch, error, getModelsError]);

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch(setFolders(updatedFolders));

    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);

    dispatch(setFolders(updatedFolders));

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

    dispatch(
      setConversations({ conversations: updatedConversations, save: true }),
    );

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch(setPrompts(updatedPrompts));
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

    dispatch(setFolders(updatedFolders));

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: `${t('New Conversation')}`,
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch(
      setSelectedConversation({ conversation: newConversation, save: true }),
    );
    dispatch(
      setConversations({ conversations: updatedConversations, save: true }),
    );

    dispatch(setLoading(false));
  };

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch(setShowChatbar(false));
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId && dispatch(setDefaultModelId(defaultModelId));
    serverSideApiKeyIsSet &&
      dispatch(setServerSideApiKeyIsSet(serverSideApiKeyIsSet));

    serverSidePluginKeysSet &&
      dispatch(setServerSidePluginKeysSet(serverSidePluginKeysSet));
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    console.log('initialize', serverSideApiKeyIsSet);
    const theme = localStorage.getItem('theme');
    if (theme) {
      dispatch(setLightMode(theme as 'dark' | 'light'));
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch(setApiKey(''));

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch(setApiKey(apiKey));
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch(setPluginKeys([]));

      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch(setPluginKeys(JSON.parse(pluginKeys) as PluginKey[]));
    }

    if (window.innerWidth < 640) {
      dispatch(setShowChatbar(false));
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch(setShowChatbar(showChatbar === 'true'));
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch(setShowPromptbar(showPromptbar === 'true'));
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch(setFolders(JSON.parse(folders) as FolderInterface[]));
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch(setPrompts(JSON.parse(prompts) as Prompt[]));
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      dispatch(
        setConversations({
          conversations: cleanedConversationHistory,
          save: true,
        }),
      );
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );
      dispatch(
        setSelectedConversation({ conversation: cleanedSelectedConversation }),
      );
    } else {
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
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
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
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar />

            <div className="flex flex-1">
              <Chat stopConversationRef={stopConversationRef} />
            </div>

            <Promptbar />
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

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
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

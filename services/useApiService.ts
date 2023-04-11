import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';

import { ChatBody, Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';
import { Plugin, PluginKey } from '@/types/plugin';

export interface GetModelsRequestProps {
  key: string;
}

export interface PostMessageProps {
  chatBody: ChatBody;
}

export interface PostMessageToPluginProps extends PostMessageProps {
  plugin: Plugin | null;
  pluginKeys: PluginKey[];
}

const useApiService = () => {
  const fetchService = useFetch();

  // const getModels = useCallback(
  // 	(
  // 		params: GetManagementRoutineInstanceDetailedParams,
  // 		signal?: AbortSignal
  // 	) => {
  // 		return fetchService.get<GetManagementRoutineInstanceDetailed>(
  // 			`/v1/ManagementRoutines/${params.managementRoutineId}/instances/${params.instanceId
  // 			}?sensorGroupIds=${params.sensorGroupId ?? ''}`,
  // 			{
  // 				signal,
  // 			}
  // 		);
  // 	},
  // 	[fetchService]
  // );

  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<OpenAIModel[]>(`/api/models`, {
        body: { key: params.key },
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  const sendMessage = useCallback(
    (params: PostMessageProps, signal?: AbortSignal) => {
      return fetchService.post<ReadableStream<Uint8Array>>('/api/chat', {
        body: params.chatBody,
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },

    [fetchService],
  );

  const sendMessageToGooglePlugin = useCallback(
    (params: PostMessageToPluginProps, signal?: AbortSignal) => {
      const body = {
        ...params.chatBody,
        googleAPIKey: params.pluginKeys
          .find((key) => key.pluginId === 'google-search')
          ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
        googleCSEId: params.pluginKeys
          .find((key) => key.pluginId === 'google-search')
          ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
      };

      return fetchService.post<Object>('/api/google', {
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  return {
    getModels,
    sendMessage,
    sendMessageToGooglePlugin,
  };
};

export default useApiService;

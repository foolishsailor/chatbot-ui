import { IconExternalLink } from '@tabler/icons-react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'next-i18next';

import { RootState } from '@/store';
import { updateConversation } from '@/store/conversationSlice';

import { OpenAIModel } from '@/types/openai';

export const ModelSelect = () => {
  const { t } = useTranslation('chat');
  const dipatch = useDispatch();

  const { selectedConversation, models, defaultModelId } = useSelector(
    (state: RootState) => ({
      models: state.application.models,
      selectedConversation: state.conversation.selectedConversation,
      defaultModelId: state.application.defaultModelId,
    }),
    shallowEqual,
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectedConversation &&
      dipatch(
        updateConversation({
          conversation: selectedConversation,
          data: {
            key: 'model',
            value: models.find(
              (model) => model.id === e.target.value,
            ) as OpenAIModel,
          },
        }),
      );
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Model')}
      </label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t('Select a model') || ''}
          value={selectedConversation?.model?.id || defaultModelId}
          onChange={handleChange}
        >
          {models.map((model) => (
            <option
              key={model.id}
              value={model.id}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.id === defaultModelId
                ? `Default (${model.name})`
                : model.name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full mt-3 text-left text-neutral-700 dark:text-neutral-400 flex items-center">
        <a
          href="https://platform.openai.com/account/usage"
          target="_blank"
          className="flex items-center"
        >
          <IconExternalLink size={18} className={'inline mr-1'} />
          {t('View Account Usage')}
        </a>
      </div>
    </div>
  );
};

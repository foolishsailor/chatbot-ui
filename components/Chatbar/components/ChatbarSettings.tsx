import { IconFileExport, IconMoon, IconSun } from '@tabler/icons-react';
import { useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'next-i18next';

import { RootState } from '@/store';
import { setLightMode } from '@/store/applicationSlice';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const dispatch = useDispatch();

  const {
    apiKey,
    lightMode,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
    conversations,
  } = useSelector(
    (state: RootState) => ({
      apiKey: state.application.apiKey,
      lightMode: state.application.lightMode,
      serverSideApiKeyIsSet: state.application.serverSideApiKeyIsSet,
      serverSidePluginKeysSet: state.application.serverSidePluginKeysSet,
      conversations: state.conversation.conversations,
    }),
    shallowEqual,
  );

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,

    handleApiKeyChange,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      <Import onImport={handleImportConversations} />

      <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      />

      <SidebarButton
        text={lightMode === 'light' ? t('Dark mode') : t('Light mode')}
        icon={
          lightMode === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />
        }
        onClick={() =>
          dispatch(setLightMode(lightMode === 'light' ? 'dark' : 'light'))
        }
      />

      {!serverSideApiKeyIsSet ? (
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      ) : null}

      {!serverSidePluginKeysSet ? <PluginKeys /> : null}
    </div>
  );
};

import { SupportedExportFormats } from '@/types/export';
import { IconFileExport, IconMoon, IconSun } from '@tabler/icons-react';
import { useContext } from 'react';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import { Import } from '../Settings/Import';
import { Key } from '../Settings/Key';
import { SidebarButton } from '../Sidebar/SidebarButton';
import { ClearConversations } from './ClearConversations';

import HomeContext from '@/pages/api/home/home.context';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');

  const {
    state: { lightMode },
    handleLightMode,
    handleExportData,
  } = useContext(HomeContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      <ClearConversations />

      <Import />

      <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={handleExportData}
      />

      <SidebarButton
        text={lightMode === 'light' ? t('Dark mode') : t('Light mode')}
        icon={
          lightMode === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />
        }
        onClick={() =>
          handleLightMode(lightMode === 'light' ? 'dark' : 'light')
        }
      />

      <Key />
    </div>
  );
};

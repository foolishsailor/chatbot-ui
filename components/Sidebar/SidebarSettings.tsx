import { IconFileExport, IconMoon, IconSun } from '@tabler/icons-react';
import { useContext } from 'react';
import { useTranslation } from 'next-i18next';
import { ClearConversations } from './ClearConversations';
import { Import } from './Import';
import { Key } from './Key';
import { SidebarButton } from './SidebarButton';

import HomeContext from '@/pages/api/home/home.context';

export const SidebarSettings = () => {
  const { t } = useTranslation('sidebar');

  const {
    state: { lightMode },
    handleLightMode,
    handleExportConversations,
  } = useContext(HomeContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      <ClearConversations />

      <Import />

      <SidebarButton
        text={t('Export conversations')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportConversations()}
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

import { SupportedExportFormats } from '@/types/export';
import { IconFileImport } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';
import { SidebarButton } from '../Sidebar/SidebarButton';

import HomeContext from '@/pages/api/home/home.context';

export const Import = () => {
  const { t } = useTranslation('sidebar');

  const { handleImportConversations } = useContext(HomeContext);

  return (
    <>
      <input
        id="import-file"
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json"
        onChange={(e) => {
          if (!e.target.files?.length) return;

          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            let json = JSON.parse(e.target?.result as string);
            handleImportConversations(json);
          };
          reader.readAsText(file);
        }}
      />

      <SidebarButton
        text={t('import data')}
        icon={<IconFileImport size={18} />}
        onClick={() => {
          const importFile = document.querySelector(
            '#import-file',
          ) as HTMLInputElement;
          if (importFile) {
            importFile.click();
          }
        }}
      />
    </>
  );
};

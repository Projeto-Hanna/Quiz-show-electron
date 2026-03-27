import { Button } from '../Button';

const DEFAULT_LINK = 'https://linktr.ee/projeto_hanna';

export const Footer = () => {
  const openExternal = () => {
    if (window.electron?.openExternal) {
      window.electron.openExternal(DEFAULT_LINK);
      return;
    }

    window.open(DEFAULT_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <Button size="small" onClick={openExternal}>
        Conheça mais sobre o Projeto Hanna
      </Button>
    </div>
  );
};

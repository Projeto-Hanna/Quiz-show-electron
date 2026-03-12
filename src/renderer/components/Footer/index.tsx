import { Paper, styled, Typography, type PaperProps } from '@mui/material';
import { pink } from '@mui/material/colors';

import './style.css';

const StyledPaper = styled(Paper)<PaperProps>(({ theme }) => ({
  width: 300,
  color: theme.palette.getContrastText(pink[500]),
  backgroundColor: pink[500],
  '&:hover': {
    backgroundColor: pink[700],
  },
  textAlign: 'center',
  marginRight: 'auto',
  marginLeft: 'auto',
  padding: 10,
}));

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
    <footer className="footer">
      <button type="button" onClick={openExternal} className="footer-button-reset">
        <StyledPaper variant="elevation" elevation={3}>
          <Typography>Conheça mais sobre o Projeto Hanna!</Typography>
        </StyledPaper>
      </button>
    </footer>
  );
};

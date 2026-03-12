import { Link } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import SettingsIcon from '@mui/icons-material/Settings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { Button, Footer, Logo, Menu } from '../components';
import { Box, Typography } from '@mui/material';

export const Home = () => {
  const exitApp = () => {
    if (window.electron) {
      window.electron.exitApp();
    }
  };

  return (
    <>
      <main>
        <Typography variant="h2">Quiz Show - Projeto Hanna</Typography>
        <Box display="flex" flexDirection="row" gap="15vw">
          <Logo />
          <Menu>
            <Link to="/test">
              <Button icon={<PlayArrowIcon />}>Partida teste</Button>
            </Link>
            <Link to="/play">
              <Button icon={<EditSquareIcon />}>Partida personalizada</Button>
            </Link>
            <Link to="/how-to-play">
              <Button icon={<LibraryBooksIcon />}>Como jogar</Button>
            </Link>
            <Link to="/settings">
              <Button icon={<SettingsIcon />}>Configurações</Button>
            </Link>
            <Button icon={<ExitToAppIcon />} onClick={exitApp}>
              Sair
            </Button>
          </Menu>
        </Box>
        <Footer />
      </main>
    </>
  );
};

import { Link } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import SettingsIcon from '@mui/icons-material/Settings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Box } from '@mui/material';

import { Button, Footer, Logo, Menu, Title } from '../components';

export const Home = () => {
  const exitApp = () => {
    if (window.electron) {
      window.electron.exitApp();
    }
  };

  return (
    <>
      <main>
        <Menu direction="column" gap="40px">
          <Title>Quiz Show do Projeto Hanna</Title>
          <Box
            display="flex"
            gap="12vw"
            alignItems="center"
            justifyContent="center"
          >
            <Logo />
            <Box display="flex" flexDirection="column" gap="20px">
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
            </Box>
          </Box>
          <Footer />
        </Menu>
      </main>
    </>
  );
};

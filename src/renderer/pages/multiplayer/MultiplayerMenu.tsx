import { Link } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box } from '@mui/material';

import { Button, Footer, Logo, Menu, Title } from '../../components';

export const MultiplayerMenu = () => {
  return (
    <>
      <main>
        <Menu direction="column" gap="40px">
          <Title>Multiplayer Online</Title>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: '20px', sm: '4vw' }}
            alignItems="center"
            justifyContent="center"
          >
            <Logo />
            <Box
              display="flex"
              flexDirection="column"
              gap="20px"
              width={{ xs: '100%', sm: 'auto' }}
            >
              <Link to="/multiplayer/host/create">
                <Button icon={<GroupsIcon />}>Criar Sala Online (Host)</Button>
              </Link>
              <Link to="/multiplayer/join">
                <Button icon={<LoginIcon />}>Entrar em Sala Online</Button>
              </Link>
              <Link to="/">
                <Button icon={<ArrowBackIcon />}>Voltar ao Menu</Button>
              </Link>
            </Box>
          </Box>
          <Footer />
        </Menu>
      </main>
    </>
  );
};

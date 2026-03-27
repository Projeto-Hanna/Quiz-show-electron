import { Link } from 'react-router-dom';

import { Button, Divider, Menu, Subtitle, Title } from '../components';
import { Paper } from '@mui/material';

export const HowToPlay = () => {
  return (
    <>
      <main>
        <Menu direction="column">
          <Title>Como jogar</Title>
          <Paper
            elevation={3}
            sx={{
              paddingX: 6,
              paddingY: 2,
              maxWidth: 600,
            }}
          >
            <Subtitle>Partida teste</Subtitle>
          </Paper>
          <Divider color="light" />
          <Paper
            elevation={3}
            sx={{
              paddingX: 6,
              paddingY: 2,
              maxWidth: 600,
            }}
          >
            <Subtitle>Partida teste</Subtitle>
          </Paper>
        </Menu>
        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

import { Button } from '../components';

export const HowToPlay = () => {
  return (
    <>
      <main>
        <Typography variant="h3">Como jogar</Typography>
        <Link to="/">
          <Button>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

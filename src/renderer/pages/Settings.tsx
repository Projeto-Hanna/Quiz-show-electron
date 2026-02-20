import { Link } from 'react-router-dom';
import { Button } from '../components';

export const Settings = () => {
  return (
    <>
      <main>
        <Link to="/">
          <Button>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

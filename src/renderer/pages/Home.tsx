import { Link } from 'react-router-dom';

import { Button, Footer, Logo, Menu } from '../components';

export const Home = () => {
  const exitApp = () => {
    if (window.electron) {
      window.electron.exitApp();
    }
  };

  return (
    <>
      <main>
        <Logo />
        <Menu>
          <Button>
            <Link to="/test">Jogar partida teste</Link>
          </Button>
          <Button>
            <Link to="/play">Partida personalizada</Link>
          </Button>
          <Button>
            <Link to="/how-to-play">Como jogar</Link>
          </Button>
          <Button onClick={exitApp}>Sair</Button>
        </Menu>
      </main>
      <Footer />
    </>
  );
};

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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '15vw',
          }}
        >
          <Logo />
          <Menu>
            <Link to="/test">
              <Button>Partida teste</Button>
            </Link>
            <Link to="/play">
              <Button>Partida personalizada</Button>
            </Link>
            <Link to="/how-to-play">
              <Button>Como jogar</Button>
            </Link>
            <Link to="/settings">
              <Button>Configurações</Button>
            </Link>
            <Button onClick={exitApp}>Sair</Button>
          </Menu>
        </div>
      </main>
      <Footer />
    </>
  );
};

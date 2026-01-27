import './App.css';
import { Button, Footer, Logo, Menu } from './components';

function App() {
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
          <Button>Jogar partida teste</Button>
          <Button>Partida personalizada</Button>
          <Button>Como jogar</Button>
          <Button onClick={exitApp}>Sair</Button>
        </Menu>
      </main>
      <Footer />
    </>
  );
}

export default App;

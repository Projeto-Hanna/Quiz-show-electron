import './App.css';
import { Button, Footer, Logo, Menu } from './components';

function App() {
  return (
    <>
      <main>
        <Logo />
        <Menu>
          <Button>Jogar partida teste</Button>
          <Button>Partida personalizada</Button>
          <Button>Como jogar</Button>
          <Button>Sair</Button>
        </Menu>
      </main>
      <Footer />
    </>
  );
}

export default App;

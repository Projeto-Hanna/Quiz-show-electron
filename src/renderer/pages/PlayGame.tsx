import { Link } from 'react-router-dom';

import { Button, GameInstance } from '../components';
import type { Question } from '../types';

export const PlayGame = () => {
  const questions: Question[] = [];

  // forms de criação de perguntas
  // input de arquivo json
  // ia que gera perguntas e respostas, se conectando a internet, no formato json

  return (
    <>
      <main>
        <GameInstance questions={questions} />
        <Link to="/">
          <Button>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

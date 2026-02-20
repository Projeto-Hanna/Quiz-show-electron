import { Link } from 'react-router-dom';

import { Button, GameInstance } from '../components';
import type { Question } from '../types';

export const TestGame = () => {
  const questions: Question[] = [
    {
      id: 1,
      question: 'O camelo sabe assobiar?',
      options: ['Sim', 'Não', 'Talvez', 'Não sei'],
      answer: 0,
    },
  ];

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

import { Link } from 'react-router-dom';

import { Button, GameInstance } from '../components';
import { DEFAULT_QUESTIONS } from '../utils/defaultQuestions';

export const TestGame = () => {
  return (
    <>
      <main>
        <GameInstance questions={DEFAULT_QUESTIONS} />
        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

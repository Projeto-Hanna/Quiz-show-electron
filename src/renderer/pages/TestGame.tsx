import { Link } from 'react-router-dom';

import { Button, GameInstance } from '../components';
import type { Question } from '../types';

const TEST_QUESTIONS: Question[] = [
  {
    question: 'Quem é a principal personagem do Projeto Hanna?',
    options: ['Hanna', 'Byte', 'Monika', 'Projeto'],
    answer: 0,
  },
  {
    question: 'Como se parece um código binário?',
    options: ['#fefefe', 'ABCDEFG', '010111'],
    answer: 2,
  },
  {
    question: 'Qual das seguintes peças não faz parte de um computador?',
    options: [
      'Fonte de energia',
      'Processador',
      'Memória RAM',
      'Sanduíche de picles',
      'Placa-mãe',
    ],
    answer: 3,
  },
];

export const TestGame = () => {
  return (
    <>
      <main>
        <GameInstance questions={TEST_QUESTIONS} />
        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

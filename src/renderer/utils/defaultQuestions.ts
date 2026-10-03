import type { Question } from '../types';

export const DEFAULT_QUESTIONS: Question[] = [
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
  {
    question: 'O que significa a sigla CPU?',
    options: [
      'Central Processing Unit',
      'Computer Power Universal',
      'Control Program User',
      'Central Performance Utility',
    ],
    answer: 0,
  },
  {
    question:
      'Qual linguagem é tipicamente executada nativamente em navegadores web?',
    options: ['Python', 'C++', 'JavaScript', 'Cobol'],
    answer: 2,
  },
];

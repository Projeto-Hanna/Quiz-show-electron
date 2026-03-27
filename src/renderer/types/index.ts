export type Question = {
  question: string;
  options: string[];
  answer: number;
};

export type UserAnswer = {
  questionPosition: number;
  selectedOption: number;
};

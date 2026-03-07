import { useEffect, useState } from 'react';
import type { Question } from '../../types';
import { Button } from '../Button';
import { AlarmClock, Trophy } from 'lucide-react';
import { Grid, Paper, Typography } from '@mui/material';

type Props = {
  questions: Question[];
};

// todo: criar settings geral de perguntas
const TIME_PER_QUESTION_IN_SECONDS = 15;
const POINTS_PER_ANSWER = 100;

export const GameInstance = (props: Props) => {
  const { questions } = props;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(
    TIME_PER_QUESTION_IN_SECONDS,
  );

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isGameFinished) return;

    const timerId = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setIsGameFinished(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [currentIndex, isGameFinished]);

  const proceedToNextQuestion = (optionIndex: number) => {
    const isRightAnswer = currentQuestion.answer === optionIndex;

    if (isRightAnswer) {
      setTotalScore((prev) => prev + POINTS_PER_ANSWER);
    }

    if (currentIndex === questions.length - 1) {
      setIsGameFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setQuestionTimer(TIME_PER_QUESTION_IN_SECONDS);
  };

  if (isGameFinished || questions.length === 0) {
    return <>Cabou: {totalScore}</>;
  }

  return (
    <div         style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '50px',
        }}
      >
        <Typography>
          <Trophy />
          {totalScore} pontos
        </Typography>
        <Typography>
          <AlarmClock /> {questionTimer} segundos restantes
        </Typography>
      </div>

      <Paper>
        <Typography variant="h4" gutterBottom>Pergunta {currentIndex + 1} de {questions.length}:</Typography>
        <Typography variant="h3" gutterBottom>{currentQuestion.question}</Typography>
      </Paper>

      <Grid container spacing={4}>
        {currentQuestion.options.map((option, index) => {
          return (
            <Grid size={6}>
              <Button
                key={`game-option-${index}`}
                onClick={() => proceedToNextQuestion(index)}
              >
                {option}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

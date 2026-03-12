import { useEffect, useState } from 'react';
import { AlarmClock, Trophy } from 'lucide-react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

import type { Question } from '../../types';
import { VictoryScreen } from '../VictoryScreen';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../Button';

type Props = {
  questions: Question[];
};

const POINTS_PER_ANSWER = 100;

export const GameInstance = (props: Props) => {
  const { questions } = props;
  const {
    settings: { timePerQuestionInSeconds },
  } = useSettings();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(
    timePerQuestionInSeconds,
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
    setQuestionTimer(timePerQuestionInSeconds);
  };

  if (isGameFinished || questions.length === 0) {
    return <VictoryScreen points={totalScore} />;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={6}
      flexDirection="column"
    >
      <Stack
        direction="row"
        spacing={6}
        justifyContent="center"
        alignItems="center"
      >
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Trophy size={32} />
            <Typography variant="h5">{totalScore} pontos</Typography>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ padding: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlarmClock size={32} />
            <Typography variant="h5">
              {questionTimer} segundos restantes
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      <Paper
        elevation={3}
        sx={{
          paddingTop: 2,
          paddingRight: 6,
          paddingLeft: 6,
          paddingBottom: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ textTransform: 'uppercase' }}
          gutterBottom
        >
          Pergunta {currentIndex + 1} de {questions.length}:
        </Typography>
        <Typography variant="h3" gutterBottom>
          {currentQuestion.question}
        </Typography>
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
    </Box>
  );
};

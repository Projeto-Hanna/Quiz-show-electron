import { useEffect, useState } from 'react';
import { AlarmClock, Trophy } from 'lucide-react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

import type { Question, UserAnswer } from '../../types';
import { VictoryScreen } from '../VictoryScreen';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../Button';
import { Subtitle } from '../Subtitle';

type Props = {
  questions: Question[];
};

const POINTS_PER_ANSWER = 100;

const getOptionLetter = (index: number): string => {
  const startingLetter = 'A';
  const startingLetterCode = startingLetter.charCodeAt(0);
  return `${String.fromCharCode(startingLetterCode + index)})`;
};

export const GameInstance = (props: Props) => {
  const { questions } = props;
  const {
    settings: { timePerQuestionInSeconds, unansweredQuestionBehavior },
  } = useSettings();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<UserAnswer[]>([]);
  const [questionTimer, setQuestionTimer] = useState<number>(
    timePerQuestionInSeconds,
  );

  const currentQuestion = questions[currentIndex];

  const handleTimeout = () => {
    if (unansweredQuestionBehavior === 'victory-screen') {
      setIsGameFinished(true);
      return;
    }

    if (currentIndex === questions.length - 1) {
      setIsGameFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setQuestionTimer(timePerQuestionInSeconds);
  };

  useEffect(() => {
    if (isGameFinished) return;

    const timerId = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleTimeout();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [currentIndex, isGameFinished, handleTimeout]);

  const proceedToNextQuestion = (optionIndex: number) => {
    setSelectedAnswers((prev) => [
      ...prev,
      { questionPosition: currentIndex, selectedOption: optionIndex },
    ]);
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
    return (
      <VictoryScreen
        selectedAnswers={selectedAnswers}
        questions={questions}
        points={totalScore}
      />
    );
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
            <Subtitle>{totalScore} pontos</Subtitle>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ padding: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AlarmClock size={32} />
            <Subtitle>{questionTimer} segundos restantes</Subtitle>
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
        <Subtitle>
          Pergunta {currentIndex + 1} de {questions.length}:
        </Subtitle>
        <Typography variant="h3">{currentQuestion.question}</Typography>
      </Paper>

      <Grid container spacing={4}>
        {currentQuestion.options.map((option, index) => {
          const shouldCenterLastOption =
            currentQuestion.options.length % 2 &&
            index === currentQuestion.options.length - 1;

          return (
            <Grid
              key={`game-option-${index}`}
              size={6}
              offset={shouldCenterLastOption ? 3 : 0}
            >
              <div>
                <Button onClick={() => proceedToNextQuestion(index)}>
                  <>
                    {getOptionLetter(index)} {option}
                  </>
                </Button>
              </div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

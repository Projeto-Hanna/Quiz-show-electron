import { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { Box, Paper, Stack, Typography } from '@mui/material';

import type { Question, UserAnswer } from '../../types';
import { VictoryScreen } from '../VictoryScreen';
import { useSettings } from '../../context/useSettings';
import { Subtitle } from '../Subtitle';
import { Title } from '../Title';
import { CountdownScreen, QuestionHeader, OptionsGrid, Button } from '../';

type Props = {
  questions: Question[];
  timePerQuestionInSeconds?: number;
};

type GamePhase = 'waiting' | 'countdown' | 'playing';

const POINTS_PER_ANSWER = 100;
const COUNTDOWN_START = 3;

export const GameInstance = (props: Props) => {
  const { questions, timePerQuestionInSeconds: customTime } = props;
  const {
    settings: {
      timePerQuestionInSeconds: settingsTime,
      unansweredQuestionBehavior,
    },
  } = useSettings();

  const timePerQuestionInSeconds = customTime ?? settingsTime;

  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [countdownValue, setCountdownValue] = useState<number>(COUNTDOWN_START);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<UserAnswer[]>([]);
  const [questionTimer, setQuestionTimer] = useState<number>(
    timePerQuestionInSeconds,
  );
  const timeoutHandledForQuestionRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  // Countdown effect
  useEffect(() => {
    if (gamePhase !== 'countdown') return;

    if (countdownValue <= 0) {
      const timeoutId = setTimeout(() => setGamePhase('playing'), 0);
      return () => clearTimeout(timeoutId);
    }

    const timerId = setTimeout(() => {
      setCountdownValue((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [gamePhase, countdownValue]);

  const handleStartCountdown = () => {
    setCountdownValue(COUNTDOWN_START);
    setGamePhase('countdown');
  };

  const handleTimeout = useCallback(() => {
    if (timeoutHandledForQuestionRef.current === currentIndex) {
      return;
    }
    timeoutHandledForQuestionRef.current = currentIndex;

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
  }, [
    currentIndex,
    questions.length,
    timePerQuestionInSeconds,
    unansweredQuestionBehavior,
  ]);

  useEffect(() => {
    if (gamePhase !== 'playing' || isGameFinished) return;

    if (questionTimer <= 0) {
      const timeoutId = setTimeout(() => handleTimeout(), 0);
      return () => clearTimeout(timeoutId);
    }

    const timerId = setInterval(() => {
      setQuestionTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [currentIndex, isGameFinished, handleTimeout, gamePhase, questionTimer]);

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

  const handleRestart = () => {
    setGamePhase('waiting');
    setCountdownValue(COUNTDOWN_START);
    setCurrentIndex(0);
    setIsGameFinished(false);
    setTotalScore(0);
    setSelectedAnswers([]);
    setQuestionTimer(timePerQuestionInSeconds);
    timeoutHandledForQuestionRef.current = null;
  };

  if (isGameFinished || questions.length === 0) {
    return (
      <VictoryScreen
        selectedAnswers={selectedAnswers}
        questions={questions}
        points={totalScore}
        onRestart={handleRestart}
      />
    );
  }

  // --- Pre-game confirmation screen ---
  if (gamePhase === 'waiting') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={4}
        flexDirection="column"
        sx={{ minHeight: '50vh' }}
      >
        <Title variant="h2">Preparar!</Title>

        <Paper
          elevation={4}
          sx={{
            p: 4,
            textAlign: 'center',
            minWidth: 'min(450px, 85vw)',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Subtitle>Resumo do Quiz</Subtitle>
            <Typography variant="h5">
              {questions.length}{' '}
              {questions.length === 1 ? 'pergunta' : 'perguntas'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {timePerQuestionInSeconds}s por pergunta
            </Typography>

            <Button fitContent onClick={handleStartCountdown} icon={<Play />}>
              Começar!
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // --- Countdown screen ---
  if (gamePhase === 'countdown') {
    return <CountdownScreen countdownValue={countdownValue} />;
  }

  // --- Playing phase ---
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={6}
      flexDirection="column"
    >
      <QuestionHeader
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        remainingTime={questionTimer}
        timeLimit={timePerQuestionInSeconds}
        totalScore={totalScore}
      />

      <Paper
        elevation={3}
        sx={{
          paddingTop: 2,
          paddingRight: { xs: 2, sm: 6 },
          paddingLeft: { xs: 2, sm: 6 },
          paddingBottom: 2,
        }}
      >
        <Subtitle>
          Pergunta {currentIndex + 1} de {questions.length}:
        </Subtitle>
        <Typography variant="h3">{currentQuestion.question}</Typography>
      </Paper>

      <OptionsGrid
        options={currentQuestion.options}
        onSelect={proceedToNextQuestion}
      />
    </Box>
  );
};

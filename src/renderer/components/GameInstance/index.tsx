import { useCallback, useEffect, useRef, useState } from 'react';
import { AlarmClock, Play, Trophy } from 'lucide-react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';

import type { Question, UserAnswer } from '../../types';
import { VictoryScreen } from '../VictoryScreen';
import { useSettings } from '../../context/useSettings';
import { Button } from '../Button';
import { Subtitle } from '../Subtitle';
import { Title } from '../Title';

type Props = {
  questions: Question[];
};

type GamePhase = 'waiting' | 'countdown' | 'playing';

const POINTS_PER_ANSWER = 100;
const COUNTDOWN_START = 3;

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
      setGamePhase('playing');
      return;
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
      handleTimeout();
      return;
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
              {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {timePerQuestionInSeconds}s por pergunta
            </Typography>
          </Stack>
        </Paper>

        <Button
          fitContent
          onClick={handleStartCountdown}
          icon={<Play />}
        >
          Começar!
        </Button>
      </Box>
    );
  }

  // --- Countdown screen ---
  if (gamePhase === 'countdown') {
    const displayValue = countdownValue > 0 ? countdownValue : 'VAI!';

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{ minHeight: '60vh' }}
      >
        <Typography
          key={countdownValue}
          variant="h1"
          fontWeight={900}
          sx={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(80px, 20vw, 200px)',
            color: 'white',
            textShadow: '4px 4px 8px rgba(0,0,0,0.4)',
            animation: 'countdownPulse 0.8s ease-out',
            '@keyframes countdownPulse': {
              '0%': {
                transform: 'scale(1.6)',
                opacity: 0,
              },
              '50%': {
                opacity: 1,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          {displayValue}
        </Typography>
      </Box>
    );
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 6 }}
        justifyContent="center"
        alignItems="center"
        width="100%"
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

      <Grid container spacing={4}>
        {currentQuestion.options.map((option, index) => {
          const shouldCenterLastOption =
            currentQuestion.options.length % 2 &&
            index === currentQuestion.options.length - 1;

          return (
            <Grid
              key={`game-option-${index}`}
              size={{ xs: 12, sm: 6 }}
              offset={{ xs: 0, sm: shouldCenterLastOption ? 3 : 0 }}
            >
              <div aria-label={`Resposta ${getOptionLetter(index)}: ${option}`}>
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

import { LinearProgress, Paper, Stack } from '@mui/material';
import { AlarmClock, Trophy, Users } from 'lucide-react';
import { Subtitle } from '../Subtitle';

type Props = {
  currentQuestionIndex: number;
  totalQuestions: number;
  remainingTime: number;
  timeLimit: number;
  totalScore?: number;
  answeredCount?: number;
  playersCount?: number;
};

export const QuestionHeader = ({
  currentQuestionIndex,
  totalQuestions,
  remainingTime,
  timeLimit,
  totalScore,
  answeredCount,
  playersCount,
}: Props) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 2, sm: 6 }}
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          flex: 1,
          width: '100%',
          minWidth: { xs: '100%', sm: 280 },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <Trophy size={32} />
          {totalScore !== undefined ? (
            <Subtitle sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.125rem' }, textAlign: 'center' }}>{totalScore} pontos</Subtitle>
          ) : (
            <Subtitle sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.125rem' }, textAlign: 'center' }}>
              Pergunta {currentQuestionIndex + 1} de {totalQuestions}
            </Subtitle>
          )}
        </Stack>
      </Paper>

      {playersCount !== undefined && answeredCount !== undefined && (
        <Paper elevation={3} sx={{ padding: 2, flex: 1, width: '100%' }}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <Users size={28} color="#ff0a69" />
              <Subtitle sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.125rem' }, textAlign: 'center' }}>
                {answeredCount} de {playersCount} responderam
              </Subtitle>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={
                playersCount > 0 ? (answeredCount / playersCount) * 100 : 0
              }
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': { bgcolor: '#51bddf' },
              }}
            />
          </Stack>
        </Paper>
      )}

      <Paper
        elevation={3}
        sx={{
          padding: 2,
          flex: 1,
          width: '100%',
          minWidth: { xs: '100%', sm: 280 },
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <AlarmClock size={32} />
            <Subtitle sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.125rem' }, textAlign: 'center' }}>{remainingTime} segundos restantes</Subtitle>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={timeLimit > 0 ? (remainingTime / timeLimit) * 100 : 0}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: remainingTime <= 5 ? '#d32f2f' : '#ff0a69',
              },
            }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

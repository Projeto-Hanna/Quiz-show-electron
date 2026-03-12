import { Box, Paper, Slider, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { Button } from '../components';
import { useSettings } from '../context/SettingsContext';

export const Settings = () => {
  const {
    settings: { timePerQuestionInSeconds },
    updateSettings,
  } = useSettings();

  const handleTimeChange = (_: Event, value: number | number[]) => {
    const next =
      typeof value === 'number' ? value : Array.isArray(value) ? value[0] : 15;

    const clamped = Math.min(60, Math.max(5, Math.round(next)));

    updateSettings({ timePerQuestionInSeconds: clamped });
  };

  return (
    <>
      <main>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={4}
        >
          <Typography variant="h3">Configurações</Typography>

          <Paper
            elevation={3}
            sx={{
              paddingX: 6,
              paddingY: 4,
              maxWidth: 600,
            }}
          >
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="bold">
                Tempo por pergunta
              </Typography>
              <Typography>
                Defina o tempo limite (em segundos) que cada jogador terá para
                responder uma pergunta. Valor atual:{' '}
                <strong>{timePerQuestionInSeconds} segundos</strong>.
              </Typography>

              <Slider
                value={timePerQuestionInSeconds}
                onChange={handleTimeChange}
                min={5}
                max={60}
                step={1}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 15, label: '15s' },
                  { value: 30, label: '30s' },
                  { value: 45, label: '45s' },
                  { value: 60, label: '60s' },
                ]}
                valueLabelDisplay="auto"
              />
            </Stack>
          </Paper>

          <Link to="/">
            <Button>Voltar</Button>
          </Link>
        </Box>
      </main>
    </>
  );
};

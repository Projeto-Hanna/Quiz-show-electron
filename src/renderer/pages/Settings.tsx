import {
  Box,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Slider,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { Link } from 'react-router-dom';

import { Button, Divider, Menu, Subtitle, Title, Text } from '../components';
import { useSettings } from '../context/SettingsContext';

export const Settings = () => {
  const {
    settings: { timePerQuestionInSeconds, unansweredQuestionBehavior },
    updateSettings,
  } = useSettings();

  const handleTimeChange = (_: Event, value: number | number[]) => {
    const next =
      typeof value === 'number' ? value : Array.isArray(value) ? value[0] : 15;

    const clamped = Math.min(300, Math.max(10, Math.round(next)));

    updateSettings({ timePerQuestionInSeconds: clamped });
  };

  const handleUnansweredBehaviorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value as 'next-question' | 'victory-screen';

    updateSettings({ unansweredQuestionBehavior: value });
  };

  return (
    <>
      <main>
        <Menu direction="column" gap="30px">
          <Title>Configurações</Title>

          <Paper
            elevation={3}
            sx={{
              paddingX: 6,
              paddingY: 2,
              maxWidth: 720,
            }}
          >
            <Subtitle>Tempo por pergunta</Subtitle>
            <Box display="flex" flexDirection="column" gap="10px">
              <Text variant="h5">
                Defina o tempo limite (em segundos) que cada jogador terá para
                responder uma pergunta.
              </Text>
              <Text variant="h5" fontWeight="bold">
                Tempo atual: {timePerQuestionInSeconds} segundos.
              </Text>
            </Box>

            <Slider
              value={timePerQuestionInSeconds}
              onChange={handleTimeChange}
              min={10}
              max={300}
              step={10}
              sx={{
                color: pink[500],
                '& .MuiSlider-rail': {
                  opacity: 0.35,
                },
                '& .MuiSlider-track': {
                  backgroundColor: pink[500],
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: pink[500],
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: pink[700],
                },
              }}
              marks={[
                { value: 10, label: '10s' },
                { value: 30, label: '30s' },
                { value: 60, label: '1m' },
                { value: 120, label: '2m' },
                { value: 180, label: '3m' },
                { value: 240, label: '4m' },
                { value: 300, label: '5m' },
              ]}
              valueLabelDisplay="auto"
            />
          </Paper>

          <Divider color="light" />

          <Paper
            elevation={3}
            sx={{
              paddingX: 6,
              paddingY: 2,
              maxWidth: 720,
            }}
          >
            <Subtitle>Comportamento</Subtitle>
            <Text variant="h5">
              Escolha o que deve acontecer quando o tempo acabar e ninguém
              responder à pergunta.
            </Text>

            <FormControl>
              <RadioGroup
                name="unanswered-question-behavior"
                value={unansweredQuestionBehavior}
                onChange={handleUnansweredBehaviorChange}
                row
                sx={{
                  gap: { sm: 1, md: 4, lg: 4 },
                }}
              >
                <FormControlLabel
                  value="next-question"
                  control={
                    <Radio
                      sx={{
                        color: pink[500],
                        '&.Mui-checked': {
                          color: pink[500],
                        },
                      }}
                    />
                  }
                  label="Pular para a próxima pergunta"
                />
                <FormControlLabel
                  value="victory-screen"
                  control={
                    <Radio
                      sx={{
                        color: pink[500],
                        '&.Mui-checked': {
                          color: pink[500],
                        },
                      }}
                    />
                  }
                  label="Ir direto para a tela de vitória"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Menu>

        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

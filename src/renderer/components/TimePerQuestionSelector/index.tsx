import { useMemo } from 'react';
import { Box, Paper, Slider } from '@mui/material';
import { pink } from '@mui/material/colors';

import { Subtitle } from '../Subtitle';
import { Text } from '../Text';

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export const TimePerQuestionSelector = ({
  value,
  onChange,
  disabled,
}: Props) => {
  const readableQuestionTime = useMemo(() => {
    const minutes = Math.trunc(value / 60);
    const seconds = value % 60;

    if (minutes > 0 && seconds > 0) {
      return `${minutes} minuto(s) e ${seconds} segundo(s)`;
    }
    if (minutes > 0) {
      return `${minutes} minuto(s)`;
    }
    return `${seconds} segundo(s)`;
  }, [value]);

  const handleTimeChange = (_: Event, newValue: number | number[]) => {
    const next =
      typeof newValue === 'number'
        ? newValue
        : Array.isArray(newValue)
          ? newValue[0]
          : 15;
    const clamped = Math.min(300, Math.max(10, Math.round(next)));
    onChange(clamped);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        paddingX: { xs: 2, sm: 3, md: 6 },
        paddingY: { xs: 2, sm: 3 },
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <Subtitle>Tempo por Pergunta</Subtitle>

        <Box display="flex" flexDirection="column" gap="10px">
          <Text variant="h5" color="text.secondary">
            Defina o tempo limite (em segundos) que cada jogador terá para
            responder uma pergunta.
          </Text>
          <Text variant="h5" fontWeight="bold" color="#b80047">
            Tempo atual: {readableQuestionTime}.
          </Text>
        </Box>

        <Slider
          value={value}
          onChange={handleTimeChange}
          disabled={disabled}
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
      </Box>
    </Paper>
  );
};

import { Box, Paper, Slider } from '@mui/material';
import { pink } from '@mui/material/colors';

import { Subtitle } from '../Subtitle';
import { Text } from '../Text';

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export const MaxPlayersSelector = ({ value, onChange, disabled }: Props) => {
  const handlePlayersChange = (_: Event, newValue: number | number[]) => {
    const next =
      typeof newValue === 'number'
        ? newValue
        : Array.isArray(newValue)
          ? newValue[0]
          : 10;
    const clamped = Math.min(150, Math.max(1, Math.round(next)));
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
        <Subtitle>Limite de Participantes</Subtitle>

        <Box display="flex" flexDirection="column" gap="10px">
          <Text variant="h5" color="text.secondary">
            Defina a quantidade máxima de jogadores que poderão se conectar a
            esta sala (até 150 participantes).
          </Text>
          <Text variant="h5" fontWeight="bold" color="#b80047">
            Limite atual: {value}{' '}
            {value === 1 ? 'participante' : 'participantes'}.
          </Text>
        </Box>

        <Slider
          value={value}
          onChange={handlePlayersChange}
          disabled={disabled}
          min={1}
          max={150}
          step={1}
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
            { value: 1, label: '1' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 75, label: '75' },
            { value: 100, label: '100' },
            { value: 125, label: '125' },
            { value: 150, label: '150' },
          ]}
          valueLabelDisplay="auto"
        />
      </Box>
    </Paper>
  );
};

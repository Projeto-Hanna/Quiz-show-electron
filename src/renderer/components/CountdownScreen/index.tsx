import { Box, Typography } from '@mui/material';
import { Title } from '../Title';

type Props = {
  countdownValue: number;
};

export const CountdownScreen = ({ countdownValue }: Props) => {
  const displayValue = countdownValue > 0 ? countdownValue : 'VAI!';

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      flexDirection="column"
      sx={{ minHeight: '60vh' }}
    >
      <Title variant="h2">PREPARE-SE!</Title>
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
            '0%': { transform: 'scale(1.6)', opacity: 0 },
            '50%': { opacity: 1 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
};

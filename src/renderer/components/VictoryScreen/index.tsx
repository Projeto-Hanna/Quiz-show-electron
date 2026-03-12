import { Box, Paper, Typography } from '@mui/material';

type Props = {
  points: number;
};

export const VictoryScreen = (props: Props) => {
  const { points } = props;

  return (
    <Box>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h2">Você ganhou {points} pontos!</Typography>
      </Paper>
    </Box>
  );
};

import {
  Card,
  CardActions,
  Stack,
  styled,
  type CardProps,
} from '@mui/material';
import './style.css';
import type { ReactElement } from 'react';
import { pink } from '@mui/material/colors';

const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  color: theme.palette.getContrastText(pink[800]),
  backgroundColor: pink[800],
}));

type Props = {
  children: ReactElement | ReactElement[];
};

export const Menu = ({ children }: Props) => {
  return (
    <StyledCard variant="outlined" sx={{ p: 1 }}>
      <CardActions>
        <Stack spacing={3} direction="column" sx={{ width: '100%' }}>
          {children}
        </Stack>
      </CardActions>
    </StyledCard>
  );
};

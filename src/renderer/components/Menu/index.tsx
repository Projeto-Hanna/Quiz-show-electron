import { Box } from '@mui/material';
import './style.css';
import type { ReactElement } from 'react';

type Props = {
  children: ReactElement | ReactElement[];
  direction: 'row' | 'column';
  gap?: number | string;
};

export const Menu = ({ children, direction, gap }: Props) => {
  return (
    <Box
      className="glass"
      display="flex"
      alignItems="center"
      flexDirection={direction}
      gap={gap || '50px'}
      sx={{
        padding: '3vh 3vw 3vh 3vw',
      }}
    >
      {children}
    </Box>
  );
};

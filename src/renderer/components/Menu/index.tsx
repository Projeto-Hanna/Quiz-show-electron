import { Box, type SxProps, type Theme } from '@mui/material';
import './style.css';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  direction: 'row' | 'column';
  gap?: number | string;
  sx?: SxProps<Theme>;
};

export const Menu = ({ children, direction, gap, sx }: Props) => {
  return (
    <Box
      className="glass"
      display="flex"
      alignItems="center"
      flexDirection={direction}
      gap={gap || '50px'}
      sx={{
        padding: '3vh 3vw 3vh 3vw',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

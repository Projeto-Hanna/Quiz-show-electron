import type { ReactNode } from 'react';
import './index.css';
import { Typography, type TypographyProps } from '@mui/material';

type Props = TypographyProps & {
  children: ReactNode | string;
};

export const Title = (props: Props) => {
  const { children, sx, ...rest } = props;

  return (
    <div className="fancy">
      <Typography
        variant="h1"
        fontWeight={900}
        letterSpacing={5}
        sx={{
          fontSize: 'clamp(20px, 3vw, 60px)',
          fontFamily: 'Anton, sans-serif',
          textAlign: 'center',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'white',
          textTransform: 'uppercase',
          px: 2,
          textShadow: '3px 3px rgb(0, 0, 0)',
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Typography>
    </div>
  );
};

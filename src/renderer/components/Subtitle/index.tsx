import { styled, Typography, type TypographyProps } from '@mui/material';
import type { ReactNode } from 'react';

const StyledTypography = styled(Typography)<TypographyProps>(() => ({
  color: '#b80047',
  textTransform: 'uppercase',
}));

type Props = TypographyProps & {
  children: ReactNode | string;
};

export const Subtitle = ({ children }: Props) => {
  return (
    <StyledTypography variant="h4" fontWeight="bold">
      {children}
    </StyledTypography>
  );
};

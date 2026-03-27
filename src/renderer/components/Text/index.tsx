import { styled, Typography, type TypographyProps } from '@mui/material';

const StyledTypography = styled(Typography)<TypographyProps>(() => ({
  color: '#b80047',
}));

export const Text = ({
  children,
  fontWeight,
  color,
  variant,
  textTransform,
}: TypographyProps) => {
  return (
    <StyledTypography
      textTransform={textTransform}
      fontWeight={fontWeight}
      variant={variant}
      sx={{
        color: color,
      }}
    >
      {children}
    </StyledTypography>
  );
};

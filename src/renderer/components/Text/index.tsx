import { styled, Typography, type TypographyProps } from '@mui/material';

const StyledTypography = styled(Typography)<TypographyProps>(() => ({
  color: '#b80047',
}));

export const Text = (props: TypographyProps) => {
  const { sx, color, ...rest } = props;
  return (
    <StyledTypography
      {...rest}
      sx={{
        ...(color && { color }),
        ...sx,
      }}
    />
  );
};

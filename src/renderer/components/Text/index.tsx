import { styled, Typography, type TypographyProps } from '@mui/material';

const StyledTypography = styled(Typography)<TypographyProps>(() => ({
  color: '#b80047',
}));

export const Text = (props: TypographyProps) => {
  const { sx, color } = props;
  return (
    <StyledTypography
      {...props}
      sx={{
        ...sx,
        color: color,
      }}
    />
  );
};

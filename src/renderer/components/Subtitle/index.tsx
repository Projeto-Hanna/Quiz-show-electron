import { styled, Typography, type TypographyProps } from '@mui/material';

const StyledTypography = styled(Typography)<TypographyProps>(() => ({
  color: '#b80047',
  textTransform: 'uppercase',
}));

export const Subtitle = (props: TypographyProps) => {
  return (
    <StyledTypography
      {...props}
      variant="h4"
      fontWeight="bold"
      sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, ...props.sx }}
    />
  );
};

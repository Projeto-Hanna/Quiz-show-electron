import { Box, type SxProps, type Theme } from '@mui/material';

type Props = {
  sx?: SxProps<Theme>;
};

export const Logo = ({ sx }: Props) => {
  return (
    <Box
      component="img"
      src="/logo.png"
      alt="Logo do Projeto Hanna"
      sx={{
        width: 'clamp(240px, 24vw, 350px)',
        height: 'auto',
        maxHeight: 'clamp(240px, 50vh, 400px)',
        objectFit: 'contain',
        ...sx,
      }}
    />
  );
};

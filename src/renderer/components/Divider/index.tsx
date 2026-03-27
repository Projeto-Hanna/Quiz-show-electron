import { Divider as MUIDivider } from '@mui/material';

type Props = {
  color: 'light' | 'dark';
};

export const Divider = ({ color }: Props) => {
  const borderColor =
    color === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(125,125,125, 0.75)';

  return (
    <MUIDivider
      flexItem
      sx={{
        borderColor,
      }}
    />
  );
};

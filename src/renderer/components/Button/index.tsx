import type { ReactElement } from 'react';
import { Button as MUIButton, type ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { pink } from '@mui/material/colors';

const StyledButton = styled(MUIButton)<ButtonProps>(({ theme }) => ({
  width: 300,
  color: theme.palette.getContrastText(pink[500]),
  backgroundColor: pink[500],
  '&:hover': {
    backgroundColor: pink[700],
  },
}));

type Props = {
  children: string | ReactElement;
  onClick?: () => void;
};

export const Button = ({ children, onClick }: Props) => {
  return (
    <StyledButton variant="contained" size="large" onClick={onClick}>
      {children}
    </StyledButton>
  );
};

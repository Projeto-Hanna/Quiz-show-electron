import { type ReactElement } from 'react';
import { Button as MUIButton, type ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { pink } from '@mui/material/colors';

const StyledButton = styled(MUIButton)<ButtonProps>(() => ({
  maxWidth: '40vw',
  color: pink[500],
  backgroundColor: 'white',
  '&:hover': {
    color: 'white',
    backgroundImage:
      'linear-gradient(135deg,#e42c2c, #ff0a69, #51bddf, #afe1f1)',
  },
  border: '4px solid transparent',
  borderImage: 'linear-gradient(135deg,#e42c2c, #ff0a69, #51bddf, #afe1f1)',
  borderImageSlice: 1,
  transition: 'all 0.3s ease',
}));

const smallButtonSx = {
  fontSize: 'clamp(14px, 1.5vw, 20px)',
  '& .MuiButton-startIcon > *:nth-of-type(1)': {
    fontSize: 'clamp(18px, 2vw, 28px)',
  },
};

const largeButtonSx = {
  fontSize: 'clamp(16px, 2vw, 26px)',
  '& .MuiButton-startIcon > *:nth-of-type(1)': {
    fontSize: 'clamp(22px, 2.6vw, 36px)',
  },
};

type Props = {
  children: string | ReactElement;
  onClick?: () => void;
  icon?: ReactElement;
  size?: 'small' | 'medium' | 'large';
  fitContent?: boolean;
  disabled?: boolean;
};

export const Button = ({
  children,
  onClick,
  icon,
  size = 'large',
  fitContent = false,
  disabled = false,
}: Props) => {
  const sx = (() => {
    if (size === 'small') {
      return smallButtonSx;
    }

    return largeButtonSx;
  })();

  return (
    <StyledButton
      sx={{
        ...sx,
        ...(fitContent
          ? {
              width: 'fit-content',
            }
          : {
              width: '100%',
            }),
      }}
      variant="contained"
      size={size}
      onClick={onClick}
      startIcon={icon}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
};

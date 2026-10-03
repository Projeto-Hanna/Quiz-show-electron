import { type ReactElement } from 'react';
import {
  Button as MUIButton,
  type ButtonProps,
  type SxProps,
  type Theme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { pink } from '@mui/material/colors';

const StyledButton = styled(MUIButton)<ButtonProps>(({ theme }) => ({
  maxWidth: 'none',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '40vw',
  },
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
  variant?: 'regular' | 'inverted';
  inverted?: boolean;
  fitContent?: boolean;
  disabled?: boolean;
  selected?: boolean;
  isCorrect?: boolean;
  sx?: SxProps<Theme>;
};

export const Button = ({
  children,
  onClick,
  icon,
  size = 'large',
  variant = 'regular',
  inverted = false,
  fitContent = false,
  disabled = false,
  selected = false,
  isCorrect = false,
  sx: customSx,
}: Props) => {
  const sizeSx = size === 'small' ? smallButtonSx : largeButtonSx;
  const isInverted = variant === 'inverted' || inverted;

  const invertedSx: SxProps<Theme> = isInverted
    ? {
        color: 'white',
        backgroundImage:
          'linear-gradient(135deg,#e42c2c, #ff0a69, #51bddf, #afe1f1)',
        backgroundColor: 'transparent',
        '&:hover': {
          color: pink[500],
          backgroundColor: 'white',
          backgroundImage: 'none',
        },
        '&.Mui-disabled': {
          opacity: 0.6,
          color: 'white',
          backgroundImage:
            'linear-gradient(135deg,#e42c2c, #ff0a69, #51bddf, #afe1f1)',
        },
      }
    : {};

  const stateSx: SxProps<Theme> = {
    ...(selected && {
      backgroundColor: '#ff0a69',
      color: 'white',
      borderImage: 'none',
      border: '4px solid #ff0a69',
      boxShadow: '0 4px 14px rgba(255, 10, 105, 0.45)',
      '&:hover': {
        backgroundColor: '#e0005a',
        color: 'white',
        backgroundImage: 'none',
      },
      '&.Mui-disabled': {
        backgroundColor: '#ff0a69',
        color: 'white',
        opacity: 0.9,
      },
    }),
    ...(isCorrect && {
      backgroundColor: '#2e7d32',
      color: 'white',
      borderImage: 'none',
      border: '4px solid #1b5e20',
      boxShadow: '0 4px 14px rgba(46, 125, 50, 0.45)',
      '&:hover': {
        backgroundColor: '#1b5e20',
        color: 'white',
        backgroundImage: 'none',
      },
      '&.Mui-disabled': {
        backgroundColor: '#2e7d32',
        color: 'white',
        opacity: 0.95,
      },
    }),
  };

  return (
    <StyledButton
      sx={{
        ...sizeSx,
        ...(fitContent
          ? {
              width: 'fit-content',
            }
          : {
              width: '100%',
            }),
        ...invertedSx,
        ...stateSx,
        ...customSx,
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

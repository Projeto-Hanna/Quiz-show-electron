import { Grid } from '@mui/material';
import { Button } from '../Button';

const getOptionLetter = (index: number): string => {
  const startingLetter = 'A';
  const startingLetterCode = startingLetter.charCodeAt(0);
  return `${String.fromCharCode(startingLetterCode + index)})`;
};

type Props = {
  options: string[];
  disabled?: boolean;
  onSelect?: (index: number) => void;
  selectedOption?: number | null;
  // Specific to Host
  correctAnswer?: number;
};

export const OptionsGrid = ({
  options,
  disabled,
  onSelect,
  selectedOption,
  correctAnswer,
}: Props) => {
  return (
    <Grid container spacing={3} width="100%">
      {options.map((option, index) => {
        const isSelected = selectedOption === index;
        const isCorrect = correctAnswer === index;
        const shouldCenterLastOption =
          options.length % 2 !== 0 && index === options.length - 1;

        return (
          <Grid
            key={`option-${index}`}
            size={{ xs: 12, sm: 6 }}
            {...(shouldCenterLastOption ? { offset: { sm: 3 } } : {})}
          >
            <div aria-label={`Resposta ${getOptionLetter(index)} ${option}`}>
              <Button
                selected={isSelected}
                disabled={disabled}
                onClick={() => onSelect?.(index)}
                isCorrect={isCorrect}
              >
                <>
                  {getOptionLetter(index)} {option}
                  {isCorrect ? ' (Correta)' : ''}
                </>
              </Button>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
};

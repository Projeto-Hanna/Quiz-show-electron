import { Box, Paper } from '@mui/material';
import { RotateCcw } from 'lucide-react';
import { Title } from '../Title';
import { Button, Divider, Menu, Subtitle, Text } from '..';
import type { Question, UserAnswer } from '../../types';

type Props = {
  points: number;
  questions: Question[];
  selectedAnswers: UserAnswer[];
  onRestart?: () => void;
};

export const VictoryScreen = (props: Props) => {
  const { points, questions, selectedAnswers, onRestart } = props;

  return (
    <Menu direction="column" gap={4}>
      <Title>Você ganhou {points} pontos!</Title>
      <Paper elevation={3} sx={{ padding: { xs: 2, sm: 4 } }}>
        {questions.length ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="start"
            gap="20px"
          >
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers.find(
                (answer) => answer.questionPosition === index,
              );

              const userIsRight =
                userAnswer?.selectedOption === question.answer;

              const userAnswerOutput = userAnswer
                ? question.options[userAnswer.selectedOption]
                : 'Não respondida';

              return (
                <Box key={index}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="start"
                    gap="6px"
                  >
                    <Subtitle textAlign="left">
                      {index + 1}. {question.question}
                    </Subtitle>
                    <Text color="green" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}>
                      RESPOSTA: {question.options[question.answer]}
                    </Text>
                    {!userIsRight && (
                      <Text color="red" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}>
                        SUA ESCOLHA: {userAnswerOutput}
                      </Text>
                    )}
                  </Box>
                  {index < questions.length - 1 && <Divider color="dark" />}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Text variant="h5">Nenhuma pergunta encontrada</Text>
        )}
      </Paper>

      {onRestart && (
        <Button fitContent onClick={onRestart} icon={<RotateCcw />}>
          Recomeçar Quiz
        </Button>
      )}
    </Menu>
  );
};

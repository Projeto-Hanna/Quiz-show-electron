import { Box, Paper } from '@mui/material';
import { Title } from '../Title';
import { Divider, Menu, Subtitle, Text } from '..';
import type { Question, UserAnswer } from '../../types';

type Props = {
  points: number;
  questions: Question[];
  selectedAnswers: UserAnswer[];
};

export const VictoryScreen = (props: Props) => {
  const { points, questions, selectedAnswers } = props;

  return (
    <Menu direction="column">
      <Title>Você ganhou {points} pontos!</Title>
      <Paper elevation={3} sx={{ padding: 4 }}>
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
                <>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="start"
                    gap="6px"
                  >
                    <Subtitle>
                      {index + 1}. {question.question}
                    </Subtitle>
                    <Text color="green" variant="h4">
                      RESPOSTA: {question.options[question.answer]}
                    </Text>
                    {!userIsRight && (
                      <Text color="red" variant="h4">
                        SUA ESCOLHA: {userAnswerOutput}
                      </Text>
                    )}
                  </Box>
                  {index < questions.length - 1 && <Divider color="dark" />}
                </>
              );
            })}
          </Box>
        ) : (
          <Text variant="h5">Nenhuma pergunta encontrada</Text>
        )}
      </Paper>
    </Menu>
  );
};

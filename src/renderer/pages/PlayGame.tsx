import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';

import {
  Button,
  GameInstance,
  Menu,
  Title,
  Text,
  QuestionSourceSelector,
  TimePerQuestionSelector,
} from '../components';
import { useSettings } from '../context/useSettings';
import type { Question } from '../types';

export const PlayGame = () => {
  const { settings } = useSettings();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(
    settings.timePerQuestionInSeconds,
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const hasQuestionsLoaded = questions.length > 0;

  const handleQuestionsLoaded = (loadedQuestions: Question[]) => {
    setQuestions(loadedQuestions);
    setSuccessMessage('Perguntas carregadas com sucesso!');
    setErrorMessage('');
  };

  if (hasQuestionsLoaded) {
    return (
      <>
        <main>
          <GameInstance
            questions={questions}
            timePerQuestionInSeconds={timePerQuestion}
          />
          <Link to="/">
            <Button fitContent>Voltar</Button>
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <main>
        <Dialog
          open={Boolean(errorMessage)}
          onClose={() => setErrorMessage('')}
          aria-labelledby="playgame-error-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="playgame-error-dialog-title">
            <Text fontWeight="bold" textTransform="uppercase" variant="h5">
              Não é possível continuar
            </Text>
          </DialogTitle>
          <DialogContent dividers>
            <Text>{errorMessage}</Text>
          </DialogContent>
          <DialogActions>
            <Button size="small" fitContent onClick={() => setErrorMessage('')}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(successMessage)}
          onClose={() => setSuccessMessage('')}
          aria-labelledby="playgame-success-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="playgame-success-dialog-title">
            <Text
              fontWeight="bold"
              textTransform="uppercase"
              variant="h5"
              color="#4caf50"
            >
              Sucesso
            </Text>
          </DialogTitle>
          <DialogContent dividers>
            <Text>{successMessage}</Text>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              fitContent
              onClick={() => setSuccessMessage('')}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        <Menu direction="column">
          <Stack spacing={3} sx={{ width: 'min(1000px, 90vw)' }}>
            <Title variant="h3">Criar Partida</Title>

            <QuestionSourceSelector
              onQuestionsLoaded={handleQuestionsLoaded}
              onError={setErrorMessage}
              onSuccess={setSuccessMessage}
            />

            <TimePerQuestionSelector
              value={timePerQuestion}
              onChange={setTimePerQuestion}
            />
          </Stack>
        </Menu>
        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { ArrowLeft, Play } from 'lucide-react';

import {
  Button,
  Divider,
  Menu,
  Subtitle,
  Text,
  Title,
  QuestionSourceSelector,
  TimePerQuestionSelector,
  ServerStatusBadge,
} from '../../components';
import { getSocket } from '../../services/socket';
import type { Question } from '../../types';
import { DEFAULT_QUESTIONS } from '../../utils/defaultQuestions';

import { useSettings } from '../../context/useSettings';

export const HostCreate = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(
    settings.timePerQuestionInSeconds,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const isAbortedRef = useRef(false);
  const createTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQuestionsLoaded = (loadedQuestions: Question[]) => {
    setQuestions(loadedQuestions);
    setErrorMessage('');
  };

  const handleCancelCreate = () => {
    isAbortedRef.current = true;
    if (createTimeoutRef.current) {
      clearTimeout(createTimeoutRef.current);
      createTimeoutRef.current = null;
    }
    setIsCreating(false);
  };

  const handleCreateRoom = () => {
    if (questions.length === 0) {
      setErrorMessage('Por favor, carregue ao menos 1 pergunta.');
      return;
    }

    isAbortedRef.current = false;
    setIsCreating(true);
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    if (createTimeoutRef.current) {
      clearTimeout(createTimeoutRef.current);
    }

    createTimeoutRef.current = setTimeout(() => {
      isAbortedRef.current = true;
      setIsCreating(false);
      setErrorMessage(
        'O servidor demorou muito para responder (tempo limite de 15 segundos excedido). Verifique sua conexão e tente novamente.',
      );
    }, 15000);

    socket.emit(
      'host:create_room',
      { questions, timePerQuestion },
      (response: {
        success: boolean;
        roomId?: string;
        hostToken?: string;
        error?: string;
      }) => {
        // Se a criação foi cancelada manualmente ou deu timeout, descarta a resposta
        if (isAbortedRef.current) {
          return;
        }

        if (createTimeoutRef.current) {
          clearTimeout(createTimeoutRef.current);
          createTimeoutRef.current = null;
        }
        setIsCreating(false);
        if (response.success && response.roomId) {
          if (response.hostToken) {
            sessionStorage.setItem('quiz_host_token', response.hostToken);
          }
          navigate(`/multiplayer/host/${response.roomId}`);
        } else {
          setErrorMessage(
            response.error || 'Não foi possível criar a sala no servidor.',
          );
        }
      },
    );
  };

  return (
    <>
      <main>
        <Dialog
          open={isCreating}
          onClose={handleCancelCreate}
          aria-labelledby="creating-room-dialog-title"
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                p: { xs: 3, sm: 4 },
                textAlign: 'center',
                borderRadius: 3,
              },
            },
          }}
        >
          <Stack spacing={2.5} alignItems="center" py={1}>
            <CircularProgress
              size={56}
              thickness={4.5}
              sx={{ color: '#ff0a69' }}
            />
            <Subtitle id="creating-room-dialog-title" textAlign="center">
              Criando Sala Multiplayer...
            </Subtitle>
            <Text variant="h5" color="text.secondary" textAlign="center">
              Conectando ao servidor e gerando o código de convite da sala. Por
              favor, aguarde alguns instantes...
            </Text>
            <Box pt={1}>
              <Button size="small" fitContent onClick={handleCancelCreate}>
                Cancelar
              </Button>
            </Box>
          </Stack>
        </Dialog>

        <Dialog
          open={Boolean(errorMessage)}
          onClose={() => setErrorMessage('')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Text fontWeight="bold" textTransform="uppercase" variant="h5">
              Aviso
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
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
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
          <Stack spacing={3} sx={{ width: '100%', maxWidth: '900px' }}>
            <Title variant="h3">Criar Sala Multiplayer (Host)</Title>
            <Text variant="h6" color="white" textAlign="center">
              Você será o apresentador da partida. Até 10 jogadores poderão se
              conectar pelo código de convite!
            </Text>

            <Box display="flex" justifyContent="center">
              <ServerStatusBadge />
            </Box>

            <QuestionSourceSelector
              onQuestionsLoaded={handleQuestionsLoaded}
              onError={setErrorMessage}
              onSuccess={setSuccessMessage}
            />

            <Divider color="light" />

            <TimePerQuestionSelector
              value={timePerQuestion}
              onChange={setTimePerQuestion}
              disabled={isCreating}
            />

            <Box display="flex" justifyContent="center" pt={1}>
              <Button
                icon={
                  isCreating ? (
                    <CircularProgress size={22} sx={{ color: 'white' }} />
                  ) : (
                    <Play size={22} />
                  )
                }
                onClick={handleCreateRoom}
                disabled={isCreating}
                inverted
              >
                {isCreating ? 'Criando Sala...' : 'Gerar Sala'}
              </Button>
            </Box>
          </Stack>
        </Menu>

        <Link to="/multiplayer">
          <Button
            fitContent
            disabled={isCreating}
            icon={<ArrowLeft size={18} />}
          >
            Voltar
          </Button>
        </Link>
      </main>
    </>
  );
};

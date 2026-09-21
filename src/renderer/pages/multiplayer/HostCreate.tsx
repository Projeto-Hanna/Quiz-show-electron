import { useState, useMemo, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button, Divider, Menu, Subtitle, Text, Title } from '../../components';
import { getSocket } from '../../services/socket';
import type { Question } from '../../types';

const DEFAULT_QUESTIONS: Question[] = [
  {
    question: 'Quem é a principal personagem do Projeto Hanna?',
    options: ['Hanna', 'Byte', 'Monika', 'Projeto'],
    answer: 0,
  },
  {
    question: 'Como se parece um código binário?',
    options: ['#fefefe', 'ABCDEFG', '010111'],
    answer: 2,
  },
  {
    question: 'Qual das seguintes peças não faz parte de um computador?',
    options: [
      'Fonte de energia',
      'Processador',
      'Memória RAM',
      'Sanduíche de picles',
      'Placa-mãe',
    ],
    answer: 3,
  },
  {
    question: 'O que significa a sigla CPU?',
    options: [
      'Central Processing Unit',
      'Computer Power Universal',
      'Control Program User',
      'Central Performance Utility',
    ],
    answer: 0,
  },
  {
    question:
      'Qual linguagem é tipicamente executada nativamente em navegadores web?',
    options: ['Python', 'C++', 'JavaScript', 'Cobol'],
    answer: 2,
  },
];

export const HostCreate = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [questionSource, setQuestionSource] = useState<'default' | 'custom'>(
    'default',
  );
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTimeChange = (_: Event, value: number | number[]) => {
    const next =
      typeof value === 'number' ? value : Array.isArray(value) ? value[0] : 15;
    const clamped = Math.min(300, Math.max(10, Math.round(next)));
    setTimePerQuestion(clamped);
  };

  const readableQuestionTime = useMemo(() => {
    const minutes = Math.trunc(timePerQuestion / 60);
    const seconds = timePerQuestion % 60;
    
    if (minutes > 0 && seconds > 0) return `${minutes} minuto(s) e ${seconds} segundo(s)`;
    if (minutes > 0) return `${minutes} minuto(s)`;
    return `${seconds} segundo(s)`;
  }, [timePerQuestion]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error(
          'O arquivo deve conter um array JSON com ao menos 1 pergunta.',
        );
      }
      setQuestions(parsed);
      setQuestionSource('custom');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao ler arquivo JSON.',
      );
    }
  };

  const handleCreateRoom = () => {
    if (questions.length === 0) {
      setErrorMessage('Por favor, carregue ao menos 1 pergunta.');
      return;
    }

    setIsCreating(true);
    const socket = getSocket();

    socket.emit(
      'host:create_room',
      { questions, timePerQuestion },
      (response: { success: boolean; roomId?: string; hostToken?: string; error?: string }) => {
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

        <Menu direction="column">
          <Stack spacing={3} sx={{ width: 'min(900px, 90vw)' }}>
            <Title variant="h3">Criar Sala Multiplayer (Host)</Title>
            <Text variant="h6" color="white" textAlign="center">
              Você será o apresentador da partida. Até 10 jogadores poderão se
              conectar pelo código de convite!
            </Text>

            <Paper
              elevation={4}
              sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}
            >
              <Stack spacing={3}>
                <Subtitle>1. Pacote de Perguntas</Subtitle>
                <Typography variant="body1" color="text.secondary">
                  {questionSource === 'default'
                    ? `Perguntas Padrão selecionadas (${questions.length} perguntas).`
                    : `Arquivo personalizado carregado (${questions.length} perguntas).`}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    size="small"
                    fitContent
                    onClick={() => {
                      setQuestions(DEFAULT_QUESTIONS);
                      setQuestionSource('default');
                    }}
                  >
                    Usar Perguntas Padrão (5)
                  </Button>

                  <Box>
                    <input
                      type="file"
                      id="json-questions-upload"
                      accept="application/json,.json"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <label htmlFor="json-questions-upload">
                      <Button
                        size="small"
                        fitContent
                        icon={<UploadFileIcon />}
                        onClick={() => {
                          document
                            .getElementById('json-questions-upload')
                            ?.click();
                        }}
                      >
                        Carregar arquivo JSON
                      </Button>
                    </label>
                  </Box>
                </Stack>

                <Divider color="light" />

                <Subtitle>2. Tempo por Pergunta</Subtitle>
                <Box display="flex" flexDirection="column" gap="10px">
                  <Text variant="body1" color="text.secondary">
                    Defina o tempo limite que cada jogador terá para responder uma pergunta.
                  </Text>
                  <Text variant="body1" fontWeight="bold">
                    Tempo selecionado: {readableQuestionTime}.
                  </Text>
                </Box>

                <Slider
                  value={timePerQuestion}
                  onChange={handleTimeChange}
                  min={10}
                  max={300}
                  step={10}
                  sx={{
                    color: pink[500],
                    '& .MuiSlider-rail': {
                      opacity: 0.35,
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: pink[500],
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: pink[500],
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: pink[700],
                    },
                  }}
                  marks={[
                    { value: 10, label: '10s' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '1m' },
                    { value: 120, label: '2m' },
                    { value: 180, label: '3m' },
                    { value: 240, label: '4m' },
                    { value: 300, label: '5m' },
                  ]}
                />

                <Divider color="light" />

                <Box display="flex" justifyContent="center" pt={1}>
                  <Button
                    icon={<PlayArrowIcon />}
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                  >
                    {isCreating
                      ? 'Criando Sala...'
                      : 'Gerar Sala e Código de Convite'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Menu>

        <Link to="/multiplayer">
          <Button fitContent icon={<ArrowBackIcon />}>
            Voltar
          </Button>
        </Link>
      </main>
    </>
  );
};

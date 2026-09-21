import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StopIcon from '@mui/icons-material/Stop';
import PeopleIcon from '@mui/icons-material/People';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button, Subtitle, Text, Title } from '../../components';
import { getSocket } from '../../services/socket';
import type {
  LobbySummary,
  MultiplayerPlayer,
  MultiplayerQuestion,
  RoundResult,
  ScoreboardEntry,
} from '../../types';

type HostPhase =
  | 'LOBBY'
  | 'COUNTDOWN'
  | 'QUESTION'
  | 'ROUND_RESULT'
  | 'SCOREBOARD'
  | 'FINISHED';

export const HostDashboard = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<HostPhase>('LOBBY');
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<MultiplayerQuestion | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(15);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();

    const rejoinHost = () => {
      const hostToken = sessionStorage.getItem('quiz_host_token');
      if (!hostToken) {
        setErrorMessage('Sessão de host não encontrada. Volte ao menu principal.');
        return;
      }
      
      socket.emit('host:rejoin_room', { roomId, hostToken }, (res: { success: boolean; summary?: LobbySummary; error?: string }) => {
        if (res.success && res.summary) {
          setPlayers(res.summary.players);
          if (res.summary.status === 'LOBBY') {
            setPhase('LOBBY');
          } else if (res.summary.status === 'COUNTDOWN') {
            setPhase('COUNTDOWN');
          } else if (res.summary.status === 'QUESTION') {
            setPhase('QUESTION');
          } else if (res.summary.status === 'SCOREBOARD') {
            setPhase('SCOREBOARD');
          } else if (res.summary.status === 'FINISHED') {
            setPhase('FINISHED');
          }
        } else {
          setErrorMessage(res.error || 'Não foi possível reconectar à sala como host.');
        }
      });
    };

    const handleConnect = () => {
      rejoinHost();
    };

    if (!socket.connected) {
      socket.once('connect', handleConnect);
    } else {
      rejoinHost();
    }

    const handlePlayerJoined = (data: {
      player: MultiplayerPlayer;
      summary: LobbySummary;
    }) => {
      setPlayers(data.summary.players);
    };

    const handlePlayerLeft = (data: {
      player: MultiplayerPlayer;
      summary: LobbySummary;
    }) => {
      setPlayers(data.summary.players);
    };

    const handleCountdown = () => {
      setPhase('COUNTDOWN');
    };

    const handleQuestionStarted = (data: { question: MultiplayerQuestion }) => {
      setCurrentQuestion(data.question);
      setAnsweredCount(0);
      setRemainingTime(data.question.timeLimit || 15);
      setPhase('QUESTION');
    };

    const handleAnswerProgress = (data: {
      totalAnswered: number;
      totalPlayers: number;
      allAnswered: boolean;
    }) => {
      setAnsweredCount(data.totalAnswered);
    };

    const handleRoundResult = (data: RoundResult) => {
      setRoundResult(data);
      setPhase('ROUND_RESULT');
    };

    const handleScoreboard = (data: { scoreboard: ScoreboardEntry[] }) => {
      setScoreboard(data.scoreboard);
      setPhase('SCOREBOARD');
    };

    const handleFinished = (data: { scoreboard: ScoreboardEntry[] }) => {
      setScoreboard(data.scoreboard);
      setPhase('FINISHED');
    };

    socket.on('connect', handleConnect);
    socket.on('room:player_joined', handlePlayerJoined);
    socket.on('room:player_left', handlePlayerLeft);
    socket.on('game:countdown', handleCountdown);
    socket.on('game:question_started', handleQuestionStarted);
    socket.on('game:answer_progress', handleAnswerProgress);
    socket.on('game:round_result', handleRoundResult);
    socket.on('game:scoreboard', handleScoreboard);
    socket.on('game:finished', handleFinished);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room:player_joined', handlePlayerJoined);
      socket.off('room:player_left', handlePlayerLeft);
      socket.off('game:countdown', handleCountdown);
      socket.off('game:question_started', handleQuestionStarted);
      socket.off('game:answer_progress', handleAnswerProgress);
      socket.off('game:round_result', handleRoundResult);
      socket.off('game:scoreboard', handleScoreboard);
      socket.off('game:finished', handleFinished);
    };
  }, [roomId]);

  // Host question timer countdown
  useEffect(() => {
    if (phase !== 'QUESTION' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Automatically trigger end round when time expires
          const socket = getSocket();
          const hostToken = sessionStorage.getItem('quiz_host_token');
          socket.emit('host:end_round', { roomId, hostToken });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, remainingTime, roomId]);

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      setErrorMessage(
        'Aguarde ao menos 1 participante para iniciar a partida.',
      );
      return;
    }

    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit(
      'host:start_game',
      { roomId, hostToken },
      (res: { success: boolean; error?: string }) => {
        if (!res.success) {
          setErrorMessage(res.error || 'Erro ao iniciar partida.');
        }
      },
    );
  };

  const handleEndRoundNow = () => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit('host:end_round', { roomId, hostToken });
  };

  const handleShowScoreboard = () => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit('host:show_scoreboard', { roomId, hostToken });
  };

  const handleNextQuestion = () => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit(
      'host:next_question',
      { roomId, hostToken },
      (res: { success: boolean; finished?: boolean }) => {
        if (res?.finished) {
          setPhase('FINISHED');
        }
      },
    );
  };

  const handleEndGameEarly = () => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit('host:end_game', { roomId, hostToken });
  };

  const handleCancelRoom = () => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit('host:cancel_room', { roomId, hostToken });
    sessionStorage.removeItem('quiz_host_token');
    navigate('/multiplayer');
  };

  return (
    <main>
      <Dialog
        open={Boolean(errorMessage)}
        onClose={() => setErrorMessage('')}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Text fontWeight="bold" variant="h5">
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

      {/* --- PHASE 1: LOBBY --- */}
      {phase === 'LOBBY' && (
        <Stack
          spacing={4}
          sx={{ width: 'min(1000px, 92vw)', alignItems: 'center' }}
        >
          <Title variant="h3">Painel do Host (Apresentador)</Title>

          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, sm: 5 },
              width: '100%',
              textAlign: 'center',
              borderRadius: 3,
              background: 'white',
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Subtitle>Código de Convite da Sala</Subtitle>
              <Box
                onClick={handleCopyCode}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: '#ffeef4',
                  border: '3px dashed #ff0a69',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.04)' },
                }}
              >
                <Typography
                  variant="h1"
                  fontWeight="bold"
                  sx={{
                    fontFamily: 'Anton, sans-serif',
                    letterSpacing: '8px',
                    color: '#ff0a69',
                    fontSize: 'clamp(42px, 8vw, 72px)',
                  }}
                >
                  {roomId}
                </Typography>
                <ContentCopyIcon sx={{ color: '#ff0a69', fontSize: 36 }} />
              </Box>

              <Typography variant="body1" color="text.secondary">
                {copiedNotification
                  ? ' Código copiado!'
                  : 'Clique no código para copiar e envie para os participantes!'}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <PeopleIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Participantes conectados: {players.length} / 10
                </Typography>
              </Box>

              {/* Connected Players Badges */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  justifyContent: 'center',
                  minHeight: 80,
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  width: '100%',
                }}
              >
                {players.length === 0 ? (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic', my: 'auto' }}
                  >
                    Aguardando jogadores entrarem com o código...
                  </Typography>
                ) : (
                  players.map((p, idx) => (
                    <Chip
                      key={p.id}
                      avatar={
                        <Avatar sx={{ bgcolor: '#ff0a69' }}>{idx + 1}</Avatar>
                      }
                      label={p.name}
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '1.1rem', py: 2.5, px: 1 }}
                    />
                  ))
                )}
              </Box>

              <Box
                pt={2}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
                width="100%"
              >
                <Button
                  icon={<PlayArrowIcon />}
                  onClick={handleStartGame}
                  disabled={players.length === 0}
                >
                  {`Iniciar Partida com ${players.length} ${players.length === 1 ? 'Jogador' : 'Jogadores'}`}
                </Button>

                <Button
                  icon={<ArrowBackIcon />}
                  onClick={handleCancelRoom}
                  fitContent
                  size="small"
                >
                  Cancelar Sala e Voltar ao Menu
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* --- PHASE 2: COUNTDOWN --- */}
      {phase === 'COUNTDOWN' && (
        <Box textAlign="center" py={8}>
          <Title variant="h1">PREPAREM-SE!</Title>
          <Typography variant="h4" color="white" mt={2}>
            O Quiz vai começar na tela de todos os participantes...
          </Typography>
        </Box>
      )}

      {/* --- PHASE 3: QUESTION --- */}
      {phase === 'QUESTION' && currentQuestion && (
        <Stack spacing={3} sx={{ width: 'min(1000px, 92vw)' }}>
          {/* Top Bar for Host */}
          <Paper elevation={4} sx={{ p: 2, borderRadius: 2 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h6" fontWeight="bold">
                  Pergunta {currentQuestion.index + 1} de{' '}
                  {currentQuestion.total}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }} textAlign="center">
                <Chip
                  icon={<TimerIcon />}
                  label={`${remainingTime}s restantes`}
                  color={remainingTime <= 5 ? 'error' : 'primary'}
                  sx={{ fontSize: '1.2rem', p: 2 }}
                />
              </Grid>
              <Grid
                size={{ xs: 12, sm: 4 }}
                textAlign={{ xs: 'left', sm: 'right' }}
              >
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {answeredCount} de {players.length} responderam
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    players.length > 0
                      ? (answeredCount / players.length) * 100
                      : 0
                  }
                  sx={{ height: 10, borderRadius: 5, mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Question Text */}
          <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center">
              {currentQuestion.question}
            </Typography>
          </Paper>

          {/* Options (Host sees correct answer highlighted) */}
          <Grid container spacing={2}>
            {currentQuestion.options.map((opt, idx) => {
              const isCorrect = idx === currentQuestion.answer;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={`host-opt-${idx}`}>
                  <Card
                    sx={{
                      p: 2,
                      border: isCorrect
                        ? '3px solid #2e7d32'
                        : '1px solid #ddd',
                      bgcolor: isCorrect ? '#e8f5e9' : 'white',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={String.fromCharCode(65 + idx)}
                        color={isCorrect ? 'success' : 'default'}
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: isCorrect ? '#2e7d32' : 'inherit',
                          fontWeight: isCorrect ? 'bold' : 'normal',
                        }}
                      >
                        {opt} {isCorrect && '✓ (Correta)'}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Control Bar for Host */}
          <Box display="flex" justifyContent="center" gap={2} pt={2}>
            <Button
              fitContent
              size="small"
              icon={<StopIcon />}
              onClick={handleEndRoundNow}
            >
              Encerrar Tempo Agora
            </Button>
          </Box>
        </Stack>
      )}

      {/* --- PHASE 4: ROUND RESULT --- */}
      {phase === 'ROUND_RESULT' && roundResult && (
        <Stack spacing={3} sx={{ width: 'min(900px, 92vw)' }}>
          <Title variant="h3">Fim da Rodada!</Title>

          <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
            <Subtitle>Resumo das Respostas dos Jogadores</Subtitle>

            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Jogador</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Resultado</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Pontos na Rodada</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Pontuação Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roundResult.playerResults.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell>{pr.name}</TableCell>
                      <TableCell align="center">
                        {pr.isCorrect ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Acertou!"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon />}
                            label={pr.answered ? 'Errou' : 'Não respondeu'}
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">+{pr.pointsEarned}</TableCell>
                      <TableCell align="right">
                        <strong>{pr.totalScore} pts</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                fitContent
                icon={<LeaderboardIcon />}
                onClick={handleShowScoreboard}
              >
                Ver Placar Geral
              </Button>
              <Button
                fitContent
                icon={<SkipNextIcon />}
                onClick={handleNextQuestion}
              >
                {roundResult.hasMoreQuestions
                  ? 'Próxima Pergunta'
                  : 'Finalizar Jogo'}
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* --- PHASE 5: SCOREBOARD --- */}
      {phase === 'SCOREBOARD' && (
        <Stack spacing={3} sx={{ width: 'min(900px, 92vw)' }}>
          <Title variant="h3">Placar Geral</Title>

          <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>
                      <strong>Posição</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Nome</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Pontos</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scoreboard.map((entry) => {
                    const isTop3 = entry.rank <= 3;
                    const badgeColor =
                      entry.rank === 1
                        ? '#ffd700'
                        : entry.rank === 2
                          ? '#c0c0c0'
                          : entry.rank === 3
                            ? '#cd7f32'
                            : 'transparent';
                    return (
                      <TableRow
                        key={entry.id}
                        sx={{
                          bgcolor: isTop3
                            ? 'rgba(255, 10, 105, 0.05)'
                            : 'transparent',
                        }}
                      >
                        <TableCell>
                          <Avatar
                            sx={{
                              bgcolor: isTop3 ? badgeColor : '#e0e0e0',
                              color: isTop3 ? '#000' : '#666',
                              fontWeight: 'bold',
                            }}
                          >
                            {entry.rank}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="h6"
                            fontWeight={isTop3 ? 'bold' : 'normal'}
                          >
                            {entry.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#ff0a69"
                          >
                            {entry.score} pts
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                fitContent
                icon={<SkipNextIcon />}
                onClick={handleNextQuestion}
              >
                Avançar para Próxima Pergunta
              </Button>
              <Button fitContent size="small" onClick={handleEndGameEarly}>
                Encerrar Partida
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* --- PHASE 6: FINISHED (PODIUM) --- */}
      {phase === 'FINISHED' && (
        <Stack
          spacing={3}
          sx={{ width: 'min(900px, 92vw)', alignItems: 'center' }}
        >
          <Title variant="h2">Fim de Jogo! 🏆</Title>

          <Paper
            elevation={6}
            sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}
          >
            <Subtitle>Pódio Final</Subtitle>

            <Grid
              container
              spacing={3}
              justifyContent="center"
              alignItems="flex-end"
              sx={{ my: 4 }}
            >
              {/* 2nd Place */}
              {scoreboard[1] && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card
                    sx={{
                      bgcolor: '#f5f5f5',
                      p: 2,
                      textAlign: 'center',
                      borderTop: '6px solid #c0c0c0',
                    }}
                  >
                    <Typography variant="h2">🥈</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {scoreboard[1].name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {scoreboard[1].score} pts
                    </Typography>
                    <Chip label="2º Lugar" sx={{ mt: 1 }} />
                  </Card>
                </Grid>
              )}

              {/* 1st Place */}
              {scoreboard[0] && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card
                    sx={{
                      bgcolor: '#fff9c4',
                      p: 3,
                      textAlign: 'center',
                      borderTop: '8px solid #ffd700',
                      transform: 'scale(1.05)',
                    }}
                  >
                    <Typography variant="h1">👑</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#b78103">
                      {scoreboard[0].name}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {scoreboard[0].score} pts
                    </Typography>
                    <Chip
                      label="CAMPEÃO!"
                      color="warning"
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  </Card>
                </Grid>
              )}

              {/* 3rd Place */}
              {scoreboard[2] && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card
                    sx={{
                      bgcolor: '#f5f5f5',
                      p: 2,
                      textAlign: 'center',
                      borderTop: '6px solid #cd7f32',
                    }}
                  >
                    <Typography variant="h2">🥉</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {scoreboard[2].name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {scoreboard[2].score} pts
                    </Typography>
                    <Chip label="3º Lugar" sx={{ mt: 1 }} />
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Other participants */}
            {scoreboard.length > 3 && (
              <Box mt={3}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Demais Participantes:
                </Typography>
                <Stack spacing={1} maxWidth={500} mx="auto">
                  {scoreboard.slice(3).map((p) => (
                    <Box
                      key={p.id}
                      display="flex"
                      justifyContent="space-between"
                      p={1.5}
                      bgcolor="#fafafa"
                      borderRadius={1}
                    >
                      <Typography>
                        {p.rank}º. {p.name}
                      </Typography>
                      <Typography fontWeight="bold">{p.score} pts</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            <Box mt={4}>
              <Button fitContent onClick={() => navigate('/')}>
                Voltar ao Menu Principal
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}
    </main>
  );
};

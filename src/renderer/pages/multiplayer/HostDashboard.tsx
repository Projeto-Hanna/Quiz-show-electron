import { useEffect, useRef, useState } from 'react';
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
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';

import {
  Button,
  Subtitle,
  Text,
  Title,
  CountdownScreen,
  QuestionHeader,
  OptionsGrid,
  ScoreboardTable,
} from '../../components';
import { getSocket } from '../../services/socket';
import { useSettings } from '../../context/useSettings';
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
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [currentQuestion, setCurrentQuestion] =
    useState<MultiplayerQuestion | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(15);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const { settings } = useSettings();
  const allAnsweredBehaviorRef = useRef(
    settings.multiplayerAllAnsweredBehavior,
  );

  useEffect(() => {
    allAnsweredBehaviorRef.current = settings.multiplayerAllAnsweredBehavior;
  }, [settings.multiplayerAllAnsweredBehavior]);

  const hasEndedRoundRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();

    const rejoinHost = () => {
      const hostToken = sessionStorage.getItem('quiz_host_token');
      if (!hostToken) {
        setErrorMessage(
          'Sessão de host não encontrada. Volte ao menu principal.',
        );
        return;
      }

      socket.emit(
        'host:rejoin_room',
        { roomId, hostToken },
        (res: { success: boolean; summary?: LobbySummary; error?: string }) => {
          if (res.success && res.summary) {
            setPlayers(res.summary.players);
            if (res.summary.maxPlayers) {
              setMaxPlayers(res.summary.maxPlayers);
            }
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
            setErrorMessage(
              res.error || 'Não foi possível reconectar à sala como host.',
            );
          }
        },
      );
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
      if (data.summary?.maxPlayers) {
        setMaxPlayers(data.summary.maxPlayers);
      }
    };

    const handlePlayerLeft = (data: {
      player: MultiplayerPlayer;
      summary: LobbySummary;
    }) => {
      setPlayers(data.summary.players);
      if (data.summary?.maxPlayers) {
        setMaxPlayers(data.summary.maxPlayers);
      }
    };

    const handleCountdown = (data?: { seconds?: number }) => {
      setCountdownValue(typeof data?.seconds === 'number' ? data.seconds : 3);
      setPhase('COUNTDOWN');
    };

    const handleQuestionStarted = (data: { question: MultiplayerQuestion }) => {
      setCurrentQuestion(data.question);
      setAnsweredCount(0);
      setRemainingTime(data.question.timeLimit || 15);
      hasEndedRoundRef.current = false;
      setIsAnswerRevealed(false);
      setPhase('QUESTION');
    };

    const handleAnswerProgress = (data: {
      totalAnswered: number;
      totalPlayers: number;
      allAnswered: boolean;
    }) => {
      setAnsweredCount(data.totalAnswered);

      if (
        data.allAnswered &&
        allAnsweredBehaviorRef.current === 'next-question' &&
        !hasEndedRoundRef.current
      ) {
        hasEndedRoundRef.current = true;
        const socket = getSocket();
        const hostToken = sessionStorage.getItem('quiz_host_token');
        socket.emit('host:end_round', { roomId, hostToken });
      }
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

    const handleResetToLobby = (data: { summary: LobbySummary }) => {
      setPhase('LOBBY');
      setPlayers(data.summary.players);
      if (data.summary?.maxPlayers) {
        setMaxPlayers(data.summary.maxPlayers);
      }
      setCurrentQuestion(null);
      setRoundResult(null);
      setScoreboard([]);
      setCountdownValue(3);
      setAnsweredCount(0);
      hasEndedRoundRef.current = false;
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
    socket.on('game:reset_to_lobby', handleResetToLobby);

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
      socket.off('game:reset_to_lobby', handleResetToLobby);
    };
  }, [roomId]);

  // Host countdown effect
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;

    if (countdownValue <= 0) return;

    const timer = setTimeout(() => {
      setCountdownValue((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, countdownValue]);

  // Host question timer countdown
  useEffect(() => {
    if (phase !== 'QUESTION' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasEndedRoundRef.current) {
            hasEndedRoundRef.current = true;
            // Automatically trigger end round when time expires
            const socket = getSocket();
            const hostToken = sessionStorage.getItem('quiz_host_token');
            socket.emit('host:end_round', { roomId, hostToken });
          }
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

  const handleKickPlayer = (playerId: string) => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit(
      'host:kick_player',
      { roomId, hostToken, playerId },
      (res: { success: boolean; summary?: LobbySummary; error?: string }) => {
        if (res?.success && res.summary) {
          setPlayers(res.summary.players);
          if (res.summary.maxPlayers) {
            setMaxPlayers(res.summary.maxPlayers);
          }
        } else if (res?.error) {
          setErrorMessage(res.error);
        }
      },
    );
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
    hasEndedRoundRef.current = true;
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

  const handleRestartGame = () => {
    const socket = getSocket();
    const hostToken = sessionStorage.getItem('quiz_host_token');
    socket.emit(
      'host:restart_game',
      { roomId, hostToken },
      (res: { success: boolean; summary?: LobbySummary; error?: string }) => {
        if (!res?.success) {
          setErrorMessage(res?.error || 'Erro ao reiniciar partida.');
        }
      },
    );
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
          sx={{ width: '100%', maxWidth: '1000px', alignItems: 'center' }}
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
                <Copy size={36} color="#ff0a69" />
              </Box>

              <Typography variant="body1" color="text.secondary">
                {copiedNotification
                  ? ' Código copiado!'
                  : 'Clique no código para copiar e envie para os participantes!'}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <Users size={24} color="#ff0a69" />
                <Typography variant="h6" fontWeight="bold">
                  Participantes conectados: {players.length} / {maxPlayers}
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
                      onDelete={() => handleKickPlayer(p.id)}
                      title="Expulsar jogador"
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
                  icon={<Play size={24} />}
                  onClick={handleStartGame}
                  disabled={players.length === 0}
                  inverted
                >
                  {`Iniciar Partida com ${players.length} ${players.length === 1 ? 'Jogador' : 'Jogadores'}`}
                </Button>

                <Button
                  icon={<ArrowLeft size={20} />}
                  onClick={handleCancelRoom}
                  fitContent
                  size="small"
                >
                  Cancelar Sala
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* --- PHASE 2: COUNTDOWN --- */}
      {phase === 'COUNTDOWN' && (
        <CountdownScreen countdownValue={countdownValue} />
      )}

      {/* --- PHASE 3: QUESTION --- */}
      {phase === 'QUESTION' && currentQuestion && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={4}
          flexDirection="column"
          sx={{ width: '100%', maxWidth: '1000px' }}
        >
          <QuestionHeader
            currentQuestionIndex={currentQuestion.index}
            totalQuestions={currentQuestion.total}
            remainingTime={remainingTime}
            timeLimit={currentQuestion.timeLimit}
            answeredCount={answeredCount}
            playersCount={players.length}
          />

          {/* Question Text */}
          <Paper
            elevation={3}
            sx={{
              paddingTop: 2,
              paddingRight: { xs: 2, sm: 6 },
              paddingLeft: { xs: 2, sm: 6 },
              paddingBottom: 2,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Subtitle>
              Pergunta {currentQuestion.index + 1} de {currentQuestion.total}:
            </Subtitle>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
            >
              {currentQuestion.question}
            </Typography>
          </Paper>

          <OptionsGrid
            options={currentQuestion.options}
            correctAnswer={
              isAnswerRevealed ? currentQuestion.answer : undefined
            }
            disabled={true}
          />

          {/* Control Bar for Host */}
          <Box display="flex" justifyContent="center" gap={2} pt={1}>
            <Button
              fitContent
              size="small"
              onClick={() => setIsAnswerRevealed((prev) => !prev)}
              inverted={isAnswerRevealed}
            >
              {isAnswerRevealed ? 'Ocultar Resposta' : 'Revelar Resposta'}
            </Button>
            <Button
              fitContent
              size="small"
              onClick={handleEndRoundNow}
              inverted
            >
              Encerrar Tempo
            </Button>
          </Box>
        </Box>
      )}

      {/* --- PHASE 4: ROUND RESULT --- */}
      {phase === 'ROUND_RESULT' && roundResult && (
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '900px' }}>
          <Title variant="h3">Fim da Rodada!</Title>

          <Paper
            elevation={4}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}
          >
            <Subtitle>Resumo das Respostas dos Jogadores</Subtitle>

            {currentQuestion && (
              <Box
                mt={3}
                mb={4}
                p={3}
                sx={{
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #eee',
                }}
              >
                <Text
                  variant="h5"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  {currentQuestion.question}
                </Text>
                <Grid
                  container
                  spacing={2}
                  sx={{ mt: 1 }}
                  justifyContent="center"
                >
                  {currentQuestion.options.map((option, idx) => {
                    const isCorrect = idx === roundResult.correctAnswerIndex;
                    const letter = String.fromCharCode(65 + idx);

                    const totalVotes = roundResult.playerResults.filter(
                      (pr) => pr.answered,
                    ).length;
                    const optionVotes = roundResult.playerResults.filter(
                      (pr) => pr.optionIndex === idx,
                    ).length;
                    const percentage =
                      totalVotes > 0
                        ? Math.round((optionVotes / totalVotes) * 100)
                        : 0;

                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: isCorrect ? '#e8f5e9' : 'white',
                            border: '1px solid',
                            borderColor: isCorrect ? '#4caf50' : '#ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1.5}>
                            {isCorrect ? (
                              <CheckCircle2 size={20} color="#4caf50" />
                            ) : (
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  border: '2px solid #ccc',
                                }}
                              />
                            )}
                            <Text
                              variant="h6"
                              fontWeight={isCorrect ? 'bold' : 'regular'}
                              color={isCorrect ? '#2e7d32' : 'text.primary'}
                            >
                              <strong>{letter}.</strong> {option}
                            </Text>
                          </Box>

                          <Text
                            variant="body1"
                            fontWeight="bold"
                            color={isCorrect ? '#2e7d32' : 'text.secondary'}
                          >
                            {percentage}% ({optionVotes})
                          </Text>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            <TableContainer sx={{ mt: 2, overflowX: 'auto' }}>
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
                            icon={<CheckCircle2 size={16} />}
                            label="Acertou!"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<XCircle size={16} />}
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

            <Box
              display="flex"
              justifyContent="center"
              gap={2}
              mt={4}
              flexWrap="wrap"
            >
              <Button
                fitContent
                icon={<Trophy size={20} />}
                onClick={handleShowScoreboard}
              >
                Ver Placar Geral
              </Button>
              <Button
                fitContent
                icon={<SkipForward size={20} />}
                onClick={handleNextQuestion}
                inverted
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
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '900px' }}>
          <Title variant="h3">Placar Geral</Title>

          <Paper
            elevation={4}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}
          >
            <ScoreboardTable scoreboard={scoreboard} />

            <Box
              display="flex"
              justifyContent="center"
              gap={2}
              mt={4}
              flexWrap="wrap"
            >
              <Button
                fitContent
                icon={<SkipForward size={20} />}
                onClick={handleNextQuestion}
                inverted
              >
                Próxima Pergunta
              </Button>
              <Button fitContent onClick={handleEndGameEarly}>
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
          sx={{ width: '100%', maxWidth: '900px', alignItems: 'center' }}
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

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              mt={4}
            >
              <Button
                fitContent
                onClick={handleRestartGame}
                icon={<RotateCcw size={20} />}
                inverted
              >
                Reiniciar Partida
              </Button>
              <Button fitContent onClick={() => navigate('/')}>
                Voltar ao Menu Principal
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}
    </main>
  );
};

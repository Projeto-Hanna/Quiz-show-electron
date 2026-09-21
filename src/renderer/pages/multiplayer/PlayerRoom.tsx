import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';

import { Button, Subtitle, Text, Title } from '../../components';
import { getSocket } from '../../services/socket';
import type {
  LobbySummary,
  MultiplayerPlayer,
  MultiplayerQuestion,
  RoundResult,
  ScoreboardEntry,
} from '../../types';

type PlayerPhase =
  | 'LOBBY'
  | 'COUNTDOWN'
  | 'QUESTION'
  | 'ROUND_RESULT'
  | 'SCOREBOARD'
  | 'FINISHED';

export const PlayerRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [playerName] = useState<string>(
    () => sessionStorage.getItem('quiz_player_name') || 'Jogador',
  );
  const [playerId] = useState<string>(
    () => sessionStorage.getItem('quiz_player_id') || '',
  );

  const [phase, setPhase] = useState<PlayerPhase>('LOBBY');
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<MultiplayerQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(15);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [roomClosedMessage, setRoomClosedMessage] = useState('');

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();

    const rejoinRoom = () => {
      const storedName = sessionStorage.getItem('quiz_player_name');
      const storedId = sessionStorage.getItem('quiz_player_id');
      if (!storedName) {
        navigate('/multiplayer/join');
        return;
      }

      socket.emit(
        'player:join_room',
        {
          roomId,
          playerName: storedName,
          playerId: storedId || undefined,
        },
        (res: {
          success: boolean;
          player?: MultiplayerPlayer;
          summary?: LobbySummary;
          error?: string;
        }) => {
          if (res.success) {
            if (socket.id) {
              sessionStorage.setItem('quiz_socket_id', socket.id);
            }
            if (res.player) {
              sessionStorage.setItem('quiz_player_id', res.player.id);
              if (res.player.playerToken) {
                sessionStorage.setItem('quiz_player_token', res.player.playerToken);
              }
              sessionStorage.setItem('quiz_player_name', res.player.name);
            }
            if (res.summary) {
              setPlayers(res.summary.players);
              if (res.summary.status === 'LOBBY') {
                setPhase('LOBBY');
              }
            }
          } else {
            setRoomClosedMessage(
              res.error || 'Não foi possível reconectar à sala.',
            );
          }
        },
      );
    };

    // Auto-rejoin if this is a fresh connection or page refresh
    const lastSocketId = sessionStorage.getItem('quiz_socket_id');
    if (!lastSocketId || !socket.connected || socket.id !== lastSocketId) {
      if (socket.connected) {
        rejoinRoom();
      } else {
        socket.once('connect', rejoinRoom);
      }
    }

    const handleConnect = () => {
      const activeSocketId = sessionStorage.getItem('quiz_socket_id');
      if (socket.id && socket.id !== activeSocketId) {
        rejoinRoom();
      }
    };

    const handlePlayerJoined = (data: { summary: LobbySummary }) => {
      setPlayers(data.summary.players);
    };

    const handlePlayerLeft = (data: { summary: LobbySummary }) => {
      setPlayers(data.summary.players);
    };

    const handleCountdown = () => {
      setPhase('COUNTDOWN');
    };

    const handleQuestionStarted = (data: { question: MultiplayerQuestion }) => {
      setCurrentQuestion(data.question);
      setSelectedOption(null);
      setHasSubmitted(false);
      setRemainingTime(data.question.timeLimit || 15);
      setPhase('QUESTION');
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

    const handleRoomClosed = (data: { reason?: string }) => {
      setRoomClosedMessage(data.reason || 'A sala foi encerrada pelo Host.');
    };

    socket.on('connect', handleConnect);
    socket.on('room:player_joined', handlePlayerJoined);
    socket.on('room:player_left', handlePlayerLeft);
    socket.on('game:countdown', handleCountdown);
    socket.on('game:question_started', handleQuestionStarted);
    socket.on('game:round_result', handleRoundResult);
    socket.on('game:scoreboard', handleScoreboard);
    socket.on('game:finished', handleFinished);
    socket.on('room:closed', handleRoomClosed);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room:player_joined', handlePlayerJoined);
      socket.off('room:player_left', handlePlayerLeft);
      socket.off('game:countdown', handleCountdown);
      socket.off('game:question_started', handleQuestionStarted);
      socket.off('game:round_result', handleRoundResult);
      socket.off('game:scoreboard', handleScoreboard);
      socket.off('game:finished', handleFinished);
      socket.off('room:closed', handleRoomClosed);
    };
  }, [roomId, navigate]);

  // Synchronized countdown for player
  useEffect(() => {
    if (phase !== 'QUESTION' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, remainingTime]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasSubmitted || !currentQuestion || remainingTime <= 0) return;

    setSelectedOption(optionIndex);
    setHasSubmitted(true);

    const socket = getSocket();
    const playerToken = sessionStorage.getItem('quiz_player_token');
    
    socket.emit('player:submit_answer', {
      roomId,
      playerId,
      playerToken,
      optionIndex,
    });
  };

  const myResult = roundResult?.playerResults.find(
    (p) => p.id === playerId,
  );
  const myScoreEntry = scoreboard.find((p) => p.id === playerId);

  const handleLeaveRoom = () => {
    sessionStorage.removeItem('quiz_socket_id');
    sessionStorage.removeItem('quiz_player_id');
    sessionStorage.removeItem('quiz_player_token');
    navigate('/');
  };

  return (
    <main>
      {/* Dialog for Room Closed */}
      <Dialog
        open={Boolean(roomClosedMessage)}
        onClose={handleLeaveRoom}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Text fontWeight="bold" variant="h5">
            Sala Encerrada
          </Text>
        </DialogTitle>
        <DialogContent dividers>
          <Text>{roomClosedMessage}</Text>
        </DialogContent>
        <DialogActions>
          <Button size="small" fitContent onClick={handleLeaveRoom}>
            Ir para o Início
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- PHASE 1: LOBBY --- */}
      {phase === 'LOBBY' && (
        <Stack
          spacing={4}
          sx={{ width: 'min(750px, 92vw)', alignItems: 'center' }}
        >
          <Title variant="h3">Sala de Espera</Title>

          <Paper
            elevation={4}
            sx={{
              p: { xs: 3, sm: 5 },
              width: '100%',
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Você está jogando como:
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#ff0a69">
                  {playerName}
                </Typography>
              </Box>

              <Chip
                label={`Código da Sala: ${roomId}`}
                color="secondary"
                sx={{ fontSize: '1.2rem', py: 2, px: 2, fontWeight: 'bold' }}
              />

              <Box display="flex" alignItems="center" gap={1} pt={1}>
                <PeopleIcon color="primary" />
                <Typography variant="h6">
                  Jogadores na sala ({players.length}/10):
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  justifyContent: 'center',
                  p: 2,
                  bgcolor: '#f9f9f9',
                  borderRadius: 2,
                  width: '100%',
                }}
              >
                {players.map((p) => (
                  <Chip
                    key={p.id}
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor:
                            p.id === playerId ? '#ff0a69' : '#51bddf',
                        }}
                      >
                        {p.name[0]}
                      </Avatar>
                    }
                    label={p.name + (p.id === playerId ? ' (Você)' : '')}
                    variant={p.id === playerId ? 'filled' : 'outlined'}
                    color={p.id === playerId ? 'primary' : 'default'}
                    sx={{ fontSize: '1rem', py: 2 }}
                  />
                ))}
              </Box>

              <Stack direction="row" spacing={1.5} alignItems="center" pt={2}>
                <CircularProgress size={24} sx={{ color: '#ff0a69' }} />
                <Typography variant="h6" color="text.secondary">
                  Aguardando o Host iniciar a partida...
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Button fitContent size="small" onClick={handleLeaveRoom}>
            Sair da Sala
          </Button>
        </Stack>
      )}

      {/* --- PHASE 2: COUNTDOWN --- */}
      {phase === 'COUNTDOWN' && (
        <Box textAlign="center" py={8}>
          <Title variant="h1">ATENÇÃO!</Title>
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              color: 'white',
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(60px, 15vw, 120px)',
              animation: 'pulse 1s infinite',
            }}
          >
            VAI COMEÇAR!
          </Typography>
        </Box>
      )}

      {/* --- PHASE 3: QUESTION --- */}
      {phase === 'QUESTION' && currentQuestion && (
        <Stack spacing={3} sx={{ width: 'min(900px, 92vw)' }}>
          {/* Top Bar */}
          <Paper elevation={4} sx={{ p: 2, borderRadius: 2 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 6, sm: 6 }}>
                <Typography variant="h6" fontWeight="bold">
                  Pergunta {currentQuestion.index + 1} de{' '}
                  {currentQuestion.total}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 6 }} textAlign="right">
                <Chip
                  icon={<TimerIcon />}
                  label={`${remainingTime}s`}
                  color={remainingTime <= 5 ? 'error' : 'primary'}
                  sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </Grid>
            </Grid>
            <LinearProgress
              variant="determinate"
              value={
                currentQuestion.timeLimit > 0
                  ? (remainingTime / currentQuestion.timeLimit) * 100
                  : 0
              }
              sx={{ height: 8, borderRadius: 4, mt: 1.5 }}
            />
          </Paper>

          {/* Question Text */}
          <Paper elevation={4} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center">
              {currentQuestion.question}
            </Typography>
          </Paper>

          {/* Waiting banner if already answered */}
          {hasSubmitted && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                bgcolor: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <CheckCircleIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold" color="#1565c0">
                  Resposta computada! Aguardando o término do tempo...
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Option Buttons */}
          <Grid container spacing={2.5}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={`player-option-${index}`}>
                  <Card
                    onClick={() => handleSelectOption(index)}
                    sx={{
                      p: 2.5,
                      cursor:
                        hasSubmitted || remainingTime <= 0
                          ? 'default'
                          : 'pointer',
                      borderRadius: 2,
                      border: isSelected
                        ? '4px solid #ff0a69'
                        : '2px solid #e0e0e0',
                      bgcolor: isSelected ? '#fff0f6' : 'white',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      opacity: hasSubmitted && !isSelected ? 0.6 : 1,
                      '&:hover': {
                        transform:
                          hasSubmitted || remainingTime <= 0
                            ? 'none'
                            : 'scale(1.02)',
                        boxShadow:
                          hasSubmitted || remainingTime <= 0 ? 'none' : 4,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: isSelected ? '#ff0a69' : '#51bddf',
                          fontWeight: 'bold',
                          color: 'white',
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </Avatar>
                      <Typography
                        variant="h6"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                      >
                        {option}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      )}

      {/* --- PHASE 4: ROUND RESULT --- */}
      {phase === 'ROUND_RESULT' && roundResult && (
        <Stack
          spacing={3}
          sx={{ width: 'min(700px, 92vw)', alignItems: 'center' }}
        >
          <Title variant="h3">Fim do Tempo!</Title>

          <Paper
            elevation={4}
            sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}
          >
            {myResult ? (
              myResult.isCorrect ? (
                <Stack spacing={2} alignItems="center">
                  <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 72 }} />
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    Você Acertou!
                  </Typography>
                  <Chip
                    label={`+${myResult.pointsEarned} pontos`}
                    color="success"
                    sx={{
                      fontSize: '1.4rem',
                      py: 2.5,
                      px: 2,
                      fontWeight: 'bold',
                    }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Sua pontuação acumulada:{' '}
                    <strong>{myResult.totalScore} pts</strong>
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={2} alignItems="center">
                  <CancelIcon sx={{ color: '#d32f2f', fontSize: 72 }} />
                  <Typography variant="h4" fontWeight="bold" color="#d32f2f">
                    {selectedOption === null
                      ? 'Tempo Esgotado!'
                      : 'Que Pena, Você Errou!'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {selectedOption === null
                      ? 'Você não selecionou nenhuma resposta a tempo.'
                      : 'Mais sorte na próxima pergunta!'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Sua pontuação acumulada:{' '}
                    <strong>{myResult.totalScore} pts</strong>
                  </Typography>
                </Stack>
              )
            ) : null}

            <Box mt={4} pt={2} borderTop="1px solid #eee">
              <Typography
                variant="body1"
                color="text.secondary"
                fontStyle="italic"
              >
                Aguarde o Host prosseguir com o placar ou próxima pergunta...
              </Typography>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* --- PHASE 5: SCOREBOARD --- */}
      {phase === 'SCOREBOARD' && (
        <Stack spacing={3} sx={{ width: 'min(850px, 92vw)' }}>
          <Title variant="h3">Placar Geral</Title>

          {/* User's Current Position Card */}
          {myScoreEntry && (
            <Paper
              elevation={4}
              sx={{
                p: 2.5,
                bgcolor: '#fff0f6',
                border: '2px solid #ff0a69',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" fontWeight="bold" color="#ff0a69">
                Sua Posição: {myScoreEntry.rank}º Lugar com {myScoreEntry.score}{' '}
                pontos!
              </Typography>
            </Paper>
          )}

          <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>
                      <strong>Posição</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Jogador</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Pontuação</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scoreboard.map((entry) => {
                    const isMe = entry.id === playerId;
                    return (
                      <TableRow
                        key={entry.id}
                        sx={{
                          bgcolor: isMe
                            ? 'rgba(255, 10, 105, 0.12)'
                            : 'transparent',
                          fontWeight: isMe ? 'bold' : 'normal',
                        }}
                      >
                        <TableCell>
                          <Avatar
                            sx={{
                              bgcolor: isMe ? '#ff0a69' : '#e0e0e0',
                              color: isMe ? '#fff' : '#444',
                            }}
                          >
                            {entry.rank}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="h6"
                            fontWeight={isMe ? 'bold' : 'normal'}
                          >
                            {entry.name} {isMe && '(Você)'}
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

            <Box mt={3} textAlign="center">
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
              >
                <HourglassTopIcon color="primary" />
                <Typography variant="body1" color="text.secondary">
                  Aguardando o Host avançar para a próxima pergunta...
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* --- PHASE 6: FINISHED (PODIUM) --- */}
      {phase === 'FINISHED' && (
        <Stack
          spacing={3}
          sx={{ width: 'min(850px, 92vw)', alignItems: 'center' }}
        >
          <Title variant="h2">Fim de Jogo! 🏆</Title>

          <Paper
            elevation={6}
            sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}
          >
            {myScoreEntry && (
              <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="#ff0a69">
                  Você terminou em {myScoreEntry.rank}º Lugar!
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Total de {myScoreEntry.score} pontos acumulados.
                </Typography>
              </Box>
            )}

            <Subtitle>Top 3 Campeões</Subtitle>
            <Grid container spacing={2} justifyContent="center" sx={{ my: 3 }}>
              {scoreboard.slice(0, 3).map((winner) => (
                <Grid size={{ xs: 12, sm: 4 }} key={winner.id}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: winner.rank === 1 ? '#fff9c4' : '#f5f5f5',
                    }}
                  >
                    <Typography variant="h2">
                      {winner.rank === 1
                        ? '👑'
                        : winner.rank === 2
                          ? '🥈'
                          : '🥉'}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {winner.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {winner.score} pts
                    </Typography>
                    <Chip
                      label={`${winner.rank}º Lugar`}
                      color={winner.rank === 1 ? 'warning' : 'default'}
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={4}>
              <Button fitContent onClick={handleLeaveRoom}>
                Voltar ao Menu Principal
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}
    </main>
  );
};

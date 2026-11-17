import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { CheckCircle2, Hourglass, Users, XCircle } from 'lucide-react';

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
import { getSyncCountdown } from '../../utils/syncTimer';
import { useLobbyRoster, type RosterEvent } from '../../utils/lobbyRoster';
import { useAutoRedirect } from '../../utils/useAutoRedirect';
import type {
  LobbyCounts,
  LobbySummary,
  MultiplayerPlayer,
  MultiplayerQuestion,
  RoomSyncState,
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

const getSessionValue = (key: string): string | null =>
  sessionStorage.getItem(key) || localStorage.getItem(key);

const setSessionValue = (key: string, value: string): void => {
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
};

const clearPlayerSession = (): void => {
  sessionStorage.removeItem('quiz_socket_id');
  [
    'quiz_player_id',
    'quiz_player_token',
    'quiz_player_name',
    'quiz_room_id',
  ].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

type RoomExitReason = 'unavailable' | 'closed' | 'kicked';

const ROOM_EXIT_TITLES: Record<RoomExitReason, string> = {
  unavailable: 'Sala Indisponível',
  closed: 'Sala Encerrada',
  kicked: 'Removido da Sala',
};

const ROOM_CLOSED_REDIRECT_SECONDS = 5;
// Longer when the game already ended, so players can still look at the podium.
const FINISHED_ROOM_CLOSED_REDIRECT_SECONDS = 15;

export const PlayerRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    summary?: LobbySummary;
    sync?: RoomSyncState;
  } | null;
  const initialSummary = locationState?.summary;
  const hasInitialSummaryRef = useRef(Boolean(initialSummary));
  const initialSyncRef = useRef<RoomSyncState | undefined>(locationState?.sync);
  const hasLocationStateRef = useRef(Boolean(locationState));
  const deadlineRef = useRef<number>(0);
  const isRoomTerminatedRef = useRef(false);

  const [playerName, setPlayerName] = useState<string>(
    () => getSessionValue('quiz_player_name') || 'Jogador',
  );
  const [playerId, setPlayerId] = useState<string>(
    () => getSessionValue('quiz_player_id') || '',
  );

  const [phase, setPhase] = useState<PlayerPhase>('LOBBY');
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const {
    players,
    replacePlayers: setPlayers,
    applyEvent: applyRosterEvent,
  } = useLobbyRoster(initialSummary?.players || []);
  const [maxPlayers, setMaxPlayers] = useState<number>(
    () => initialSummary?.maxPlayers || 10,
  );
  const [currentQuestion, setCurrentQuestion] =
    useState<MultiplayerQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(15);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [roomExit, setRoomExit] = useState<{
    reason: RoomExitReason;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();

    const applySyncState = (sync: RoomSyncState) => {
      if (sync.status === 'LOBBY') {
        setPhase('LOBBY');
      } else if (sync.status === 'COUNTDOWN') {
        setPhase('COUNTDOWN');
      } else if (sync.status === 'QUESTION') {
        if (sync.currentQuestion) {
          const { deadline, remainingSeconds } = getSyncCountdown(sync);
          deadlineRef.current = deadline;
          setCurrentQuestion(sync.currentQuestion);
          setRemainingTime(remainingSeconds);
          setHasSubmitted(Boolean(sync.playerAnswered));
          setSelectedOption(sync.playerSelectedOption ?? null);
        }
        setPhase('QUESTION');
      } else if (sync.status === 'ROUND_RESULT') {
        if (sync.currentQuestion) {
          setCurrentQuestion(sync.currentQuestion);
        }
        if (sync.roundResult) {
          setRoundResult(sync.roundResult);
        }
        setHasSubmitted(Boolean(sync.playerAnswered));
        setSelectedOption(sync.playerSelectedOption ?? null);
        setPhase('ROUND_RESULT');
      } else if (sync.status === 'SCOREBOARD') {
        if (sync.scoreboard) {
          setScoreboard(sync.scoreboard);
        }
        setPhase('SCOREBOARD');
      } else if (sync.status === 'FINISHED') {
        if (sync.scoreboard) {
          setScoreboard(sync.scoreboard);
        }
        setPhase('FINISHED');
      }
    };

    const rejoinRoom = () => {
      if (isRoomTerminatedRef.current) return;

      const storedName = getSessionValue('quiz_player_name');
      const storedToken = getSessionValue('quiz_player_token');
      if (!storedName) {
        navigate('/multiplayer/join');
        return;
      }

      socket.emit(
        'player:join_room',
        {
          roomId,
          playerName: storedName,
          playerToken: storedToken || undefined,
        },
        (res: {
          success: boolean;
          player?: MultiplayerPlayer;
          summary?: LobbySummary;
          sync?: RoomSyncState;
          error?: string;
          code?: 'KICKED';
        }) => {
          if (res.success) {
            if (socket.id) {
              sessionStorage.setItem('quiz_socket_id', socket.id);
            }
            if (res.player) {
              setSessionValue('quiz_player_id', res.player.id);
              setPlayerId(res.player.id);
              if (res.player.playerToken) {
                setSessionValue('quiz_player_token', res.player.playerToken);
              }
              setSessionValue('quiz_player_name', res.player.name);
              setPlayerName(res.player.name);
              setSessionValue('quiz_room_id', roomId);
            }
            if (res.summary) {
              setPlayers(res.summary.players);
              if (res.summary.maxPlayers) {
                setMaxPlayers(res.summary.maxPlayers);
              }
            }

            if (res.sync) {
              applySyncState(res.sync);
            } else if (res.summary?.status === 'LOBBY') {
              setPhase('LOBBY');
            }
          } else {
            // The room no longer exists (or can't be rejoined): show why and
            // leave to the menu automatically.
            isRoomTerminatedRef.current = true;
            clearPlayerSession();
            setRoomExit({
              reason: res.code === 'KICKED' ? 'kicked' : 'unavailable',
              message: res.error || 'Não foi possível reconectar à sala.',
            });
          }
        },
      );
    };

    // Auto-rejoin if this is a fresh connection, page refresh, or missing initial summary
    const lastSocketId = sessionStorage.getItem('quiz_socket_id');
    if (
      socket.connected &&
      (!lastSocketId ||
        socket.id !== lastSocketId ||
        !hasInitialSummaryRef.current)
    ) {
      rejoinRoom();
    } else if (socket.connected && initialSyncRef.current) {
      // Only trust the sync handed over by PlayerJoin while still on that same
      // connection. After a page reload the router state survives but is stale,
      // so we wait for the 'connect' handler to rejoin and fetch a fresh sync.
      applySyncState(initialSyncRef.current);
    }
    initialSyncRef.current = undefined;

    // Drop the navigation state so a later reload can't replay this snapshot.
    if (hasLocationStateRef.current) {
      hasLocationStateRef.current = false;
      navigate(`/multiplayer/room/${roomId}`, { replace: true, state: null });
    }

    const handleConnect = () => {
      if (isRoomTerminatedRef.current) return;
      const activeSocketId = sessionStorage.getItem('quiz_socket_id');
      if (socket.id && socket.id !== activeSocketId) {
        rejoinRoom();
      }
    };

    // If an incremental roster event was missed (e.g. while this page was still
    // mounting after PlayerJoin), rejoin to fetch the full list again.
    let resyncTimer: ReturnType<typeof setTimeout> | undefined;
    const handleRosterEvent = (event: RosterEvent) => {
      const consistent = applyRosterEvent(event);
      if (event.summary?.maxPlayers) {
        setMaxPlayers(event.summary.maxPlayers);
      }
      if (!consistent && !resyncTimer && !isRoomTerminatedRef.current) {
        resyncTimer = setTimeout(() => {
          resyncTimer = undefined;
          rejoinRoom();
        }, 500);
      }
    };

    const handlePlayerJoined = (data: {
      player: MultiplayerPlayer;
      summary: LobbyCounts;
    }) => handleRosterEvent({ type: 'joined', ...data });

    const handlePlayerLeft = (data: {
      player: MultiplayerPlayer;
      summary: LobbyCounts;
    }) => handleRosterEvent({ type: 'left', ...data });

    const handlePlayerConnection = (data: {
      playerId: string;
      connected: boolean;
      summary: LobbyCounts;
    }) => handleRosterEvent({ type: 'connection', ...data });

    const handleCountdown = (data?: { seconds?: number }) => {
      setCountdownValue(typeof data?.seconds === 'number' ? data.seconds : 3);
      setPhase('COUNTDOWN');
    };

    const handleQuestionStarted = (data: { question: MultiplayerQuestion }) => {
      const limit = data.question.timeLimit || 15;
      deadlineRef.current = Date.now() + limit * 1000;
      setCurrentQuestion(data.question);
      setSelectedOption(null);
      setHasSubmitted(false);
      setRemainingTime(limit);
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

    const handleResetToLobby = (data: { summary: LobbySummary }) => {
      setPhase('LOBBY');
      setPlayers(data.summary.players);
      if (data.summary?.maxPlayers) {
        setMaxPlayers(data.summary.maxPlayers);
      }
      setCurrentQuestion(null);
      setSelectedOption(null);
      setHasSubmitted(false);
      setRoundResult(null);
      setScoreboard([]);
      setCountdownValue(3);
    };

    const handleRoomClosed = (data: { reason?: string }) => {
      isRoomTerminatedRef.current = true;
      clearPlayerSession();
      setRoomExit({
        reason: 'closed',
        message: data?.reason || 'A sala foi encerrada pelo Host.',
      });
    };

    const handleKicked = (data: { reason?: string }) => {
      isRoomTerminatedRef.current = true;
      clearPlayerSession();
      setRoomExit({
        reason: 'kicked',
        message: data?.reason || 'Você foi removido da sala pelo Host.',
      });
    };

    socket.on('connect', handleConnect);
    socket.on('room:player_joined', handlePlayerJoined);
    socket.on('room:player_left', handlePlayerLeft);
    socket.on('room:player_connection', handlePlayerConnection);
    socket.on('game:countdown', handleCountdown);
    socket.on('game:question_started', handleQuestionStarted);
    socket.on('game:round_result', handleRoundResult);
    socket.on('game:scoreboard', handleScoreboard);
    socket.on('game:finished', handleFinished);
    socket.on('game:reset_to_lobby', handleResetToLobby);
    socket.on('room:closed', handleRoomClosed);
    socket.on('room:kicked', handleKicked);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room:player_joined', handlePlayerJoined);
      socket.off('room:player_left', handlePlayerLeft);
      socket.off('room:player_connection', handlePlayerConnection);
      socket.off('game:countdown', handleCountdown);
      socket.off('game:question_started', handleQuestionStarted);
      socket.off('game:round_result', handleRoundResult);
      socket.off('game:scoreboard', handleScoreboard);
      socket.off('game:finished', handleFinished);
      socket.off('game:reset_to_lobby', handleResetToLobby);
      socket.off('room:closed', handleRoomClosed);
      socket.off('room:kicked', handleKicked);
      if (resyncTimer) clearTimeout(resyncTimer);
    };
  }, [roomId, navigate, setPlayers, applyRosterEvent]);

  // Countdown effect
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;

    if (countdownValue <= 0) return;

    const timer = setTimeout(() => {
      setCountdownValue((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, countdownValue]);

  // Synchronized countdown for player
  useEffect(() => {
    if (phase !== 'QUESTION' || !currentQuestion) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setRemainingTime(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [phase, currentQuestion]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasSubmitted || !currentQuestion || remainingTime <= 0) return;

    setSelectedOption(optionIndex);
    setHasSubmitted(true);

    const socket = getSocket();
    const playerToken = getSessionValue('quiz_player_token');

    socket.emit(
      'player:submit_answer',
      {
        roomId,
        playerToken,
        optionIndex,
        questionIndex: currentQuestion.index,
      },
      (res: {
        success: boolean;
        pointsEarned?: number;
        isCorrect?: boolean;
        error?: string;
      }) => {
        if (!res?.success && res?.error !== 'Resposta já enviada.') {
          setHasSubmitted(false);
          setSelectedOption(null);
        }
      },
    );
  };

  const myResult = roundResult?.playerResults.find((p) => p.id === playerId);
  const myScoreEntry = scoreboard.find((p) => p.id === playerId);

  const redirectSeconds =
    phase === 'FINISHED'
      ? FINISHED_ROOM_CLOSED_REDIRECT_SECONDS
      : ROOM_CLOSED_REDIRECT_SECONDS;

  const handleLeaveAfterExit = () => {
    clearPlayerSession();
    navigate('/', { replace: true });
  };

  // Leave automatically shortly after showing why the player is out of the room
  // (room unavailable on rejoin, closed by the Host, or player kicked).
  const {
    remainingSeconds: exitRemaining,
    isCancelled: isExitRedirectCancelled,
    cancel: cancelExitRedirect,
  } = useAutoRedirect(Boolean(roomExit), redirectSeconds, handleLeaveAfterExit);

  const canStayOnResults =
    roomExit?.reason === 'closed' && phase === 'FINISHED';

  const handleLeaveRoom = () => {
    const socket = getSocket();
    const playerToken = getSessionValue('quiz_player_token');
    if (roomId && socket.connected && !isRoomTerminatedRef.current) {
      socket.emit('player:leave_room', {
        roomId,
        playerToken: playerToken || undefined,
      });
    }
    clearPlayerSession();
    navigate('/');
  };

  return (
    <main>
      {/* Dialog shown when the player is out of the room */}
      <Dialog
        open={Boolean(roomExit) && !isExitRedirectCancelled}
        onClose={canStayOnResults ? cancelExitRedirect : handleLeaveAfterExit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Text fontWeight="bold" variant="h5">
            {roomExit && ROOM_EXIT_TITLES[roomExit.reason]}
          </Text>
        </DialogTitle>
        <DialogContent dividers>
          <Text>{roomExit?.message}</Text>
          <Text variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Você será levado ao menu principal em {exitRemaining}{' '}
            {exitRemaining === 1 ? 'segundo' : 'segundos'}.
          </Text>
        </DialogContent>
        <DialogActions>
          {canStayOnResults && (
            <Button size="small" fitContent onClick={cancelExitRedirect}>
              Continuar Vendo o Resultado
            </Button>
          )}
          <Button size="small" fitContent onClick={handleLeaveAfterExit}>
            Ir para o Início
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- PHASE 1: LOBBY --- */}
      {phase === 'LOBBY' && (
        <Stack
          spacing={4}
          sx={{ width: '100%', maxWidth: '750px', alignItems: 'center' }}
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
                <Title
                  variant="h3"
                  sx={{
                    color: '#ff0a69',
                    WebkitTextFillColor: '#ff0a69',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                  }}
                >
                  {playerName}
                </Title>
              </Box>

              <Chip
                label={`Código da Sala: ${roomId}`}
                color="secondary"
                sx={{ fontSize: '1.2rem', py: 2, px: 2, fontWeight: 'bold' }}
              />

              <Box display="flex" alignItems="center" gap={1} pt={1}>
                <Users size={22} color="#ff0a69" />
                <Typography variant="h6">
                  Jogadores na sala ({players.length}/{maxPlayers}):
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  justifyContent: 'center',
                  alignContent: 'flex-start',
                  maxHeight: 280,
                  overflowY: 'auto',
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
                          bgcolor: p.id === playerId ? '#ff0a69' : '#51bddf',
                        }}
                      >
                        {p.name[0]}
                      </Avatar>
                    }
                    label={
                      p.name +
                      (p.id === playerId
                        ? ' (Você)'
                        : p.connected === false
                          ? ' (desconectado)'
                          : '')
                    }
                    variant={p.id === playerId ? 'filled' : 'outlined'}
                    color={p.id === playerId ? 'primary' : 'default'}
                    sx={{
                      fontSize: '1rem',
                      py: 2,
                      opacity:
                        p.id !== playerId && p.connected === false ? 0.55 : 1,
                    }}
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
          sx={{ width: '100%', maxWidth: '950px' }}
        >
          {/* Top Bar matching GameInstance */}
          <QuestionHeader
            currentQuestionIndex={currentQuestion.index}
            totalQuestions={currentQuestion.total}
            remainingTime={remainingTime}
            timeLimit={currentQuestion.timeLimit}
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

          {/* Waiting banner if already answered */}
          {hasSubmitted && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                bgcolor: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: 2,
                width: '100%',
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <CheckCircle2 color="#2196f3" size={28} />
                <Typography variant="h6" fontWeight="bold" color="#1565c0">
                  Resposta computada! Aguardando o término do tempo...
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Option Buttons */}
          <OptionsGrid
            options={currentQuestion.options}
            disabled={hasSubmitted || remainingTime <= 0}
            onSelect={handleSelectOption}
            selectedOption={selectedOption}
          />
        </Box>
      )}

      {/* --- PHASE 4: ROUND RESULT --- */}
      {phase === 'ROUND_RESULT' && roundResult && (
        <Stack
          spacing={3}
          sx={{ width: '100%', maxWidth: '700px', alignItems: 'center' }}
        >
          <Title variant="h3">Fim do Tempo!</Title>

          <Paper
            elevation={4}
            sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}
          >
            {myResult ? (
              myResult.isCorrect ? (
                <Stack spacing={2} alignItems="center">
                  <CheckCircle2 color="#2e7d32" size={72} />
                  <Title
                    variant="h3"
                    sx={{
                      color: '#2e7d32',
                      WebkitTextFillColor: '#2e7d32',
                      textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                    }}
                  >
                    Você Acertou!
                  </Title>
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
                  <XCircle color="#d32f2f" size={72} />
                  <Title
                    variant="h3"
                    sx={{
                      color: '#d32f2f',
                      WebkitTextFillColor: '#d32f2f',
                      textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                    }}
                  >
                    {!myResult.answered
                      ? 'Tempo Esgotado!'
                      : 'Que Pena, Você Errou!'}
                  </Title>
                  <Typography variant="h6" color="text.secondary">
                    {!myResult.answered
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
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '850px' }}>
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
              <Title
                variant="h4"
                sx={{
                  color: '#ff0a69',
                  WebkitTextFillColor: '#ff0a69',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                }}
              >
                Sua Posição: {myScoreEntry.rank}º Lugar
              </Title>
              <Typography variant="h6" fontWeight="bold" color="#ff0a69" mt={1}>
                com {myScoreEntry.score} pontos!
              </Typography>
            </Paper>
          )}

          <Paper
            elevation={4}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}
          >
            <ScoreboardTable scoreboard={scoreboard} playerId={playerId} />

            <Box mt={3} textAlign="center">
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
              >
                <Hourglass color="#ff0a69" size={24} />
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
          sx={{ width: '100%', maxWidth: '850px', alignItems: 'center' }}
        >
          <Title variant="h2">Fim de Jogo! 🏆</Title>

          <Paper
            elevation={6}
            sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}
          >
            {myScoreEntry && (
              <Box mb={4}>
                <Title
                  variant="h3"
                  sx={{
                    color: '#ff0a69',
                    WebkitTextFillColor: '#ff0a69',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                  }}
                >
                  Você terminou em {myScoreEntry.rank}º Lugar!
                </Title>
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

            <Box mt={3}>
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                {roomExit
                  ? 'A sala foi encerrada. Obrigado por jogar!'
                  : 'Aguardando o anfitrião reiniciar a partida...'}
              </Typography>
            </Box>

            <Box mt={3}>
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

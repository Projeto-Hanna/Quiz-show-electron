import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, LogIn } from 'lucide-react';

import { Button, Menu, Subtitle, Text, Title } from '../../components';
import { getSocket } from '../../services/socket';
import type { LobbySummary, MultiplayerPlayer } from '../../types';

export const PlayerJoin = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanRoomId = roomId.trim().toUpperCase();
    const cleanName = playerName.trim();

    if (!cleanRoomId) {
      setErrorMessage('Digite o código de 4 letras da sala.');
      return;
    }

    if (!cleanName) {
      setErrorMessage('Digite o seu nome para identificação no jogo.');
      return;
    }

    setIsLoading(true);
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const timeout = setTimeout(() => {
      setIsLoading(false);
      setErrorMessage(
        'O servidor demorou muito para responder. Verifique sua conexão e tente novamente.',
      );
    }, 12000);

    socket.emit(
      'player:join_room',
      { roomId: cleanRoomId, playerName: cleanName },
      (res: {
        success: boolean;
        player?: MultiplayerPlayer;
        summary?: LobbySummary;
        error?: string;
      }) => {
        clearTimeout(timeout);
        setIsLoading(false);
        if (res.success && res.player) {
          // Save session info
          if (socket.id) {
            sessionStorage.setItem('quiz_socket_id', socket.id);
          }
          sessionStorage.setItem('quiz_player_id', res.player.id);
          if (res.player.playerToken) {
            sessionStorage.setItem('quiz_player_token', res.player.playerToken);
          }
          sessionStorage.setItem('quiz_player_name', res.player.name);
          sessionStorage.setItem('quiz_room_id', cleanRoomId);
          navigate(`/multiplayer/room/${cleanRoomId}`);
        } else {
          setErrorMessage(res.error || 'Não foi possível entrar na sala.');
        }
      },
    );
  };

  return (
    <>
      <main>
        {/* Loading Dialog for Joining */}
        <Dialog
          open={isLoading}
          aria-labelledby="joining-room-dialog-title"
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
            <Typography
              id="joining-room-dialog-title"
              variant="h5"
              fontWeight="bold"
            >
              Entrando na Sala...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Validando o código e conectando à partida. Por favor, aguarde...
            </Typography>
          </Stack>
        </Dialog>

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

        <Menu direction="column">
          <Stack spacing={3} sx={{ width: '100%', maxWidth: '550px' }}>
            <Title variant="h3">Entrar em uma Sala</Title>

            <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
              <form onSubmit={handleJoin}>
                <Stack spacing={3}>
                  <Subtitle>Insira os dados da partida</Subtitle>

                  <TextField
                    fullWidth
                    label="Código da Sala"
                    placeholder="Ex: ABCD"
                    value={roomId}
                    disabled={isLoading}
                    onChange={(e) =>
                      setRoomId(e.target.value.toUpperCase().slice(0, 6))
                    }
                    inputProps={{
                      style: {
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      },
                    }}
                    autoFocus
                  />

                  <TextField
                    fullWidth
                    label="Seu Nome / Apelido"
                    placeholder="Como você quer ser chamado?"
                    value={playerName}
                    disabled={isLoading}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                    inputProps={{
                      style: {
                        fontSize: '1.1rem',
                        textAlign: 'center',
                      },
                    }}
                  />

                  <Box display="flex" justifyContent="center" pt={1}>
                    <Button
                      icon={
                        isLoading ? (
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                          <LogIn size={20} />
                        )
                      }
                      onClick={handleJoin}
                      disabled={
                        isLoading || !roomId.trim() || !playerName.trim()
                      }
                      inverted
                    >
                      {isLoading ? 'Entrando...' : 'Entrar no Quiz'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Paper>
          </Stack>
        </Menu>

        <Link to="/multiplayer">
          <Button
            fitContent
            disabled={isLoading}
            icon={<ArrowLeft size={18} />}
          >
            Voltar
          </Button>
        </Link>
      </main>
    </>
  );
};

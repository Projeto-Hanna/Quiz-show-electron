import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

    socket.emit(
      'player:join_room',
      { roomId: cleanRoomId, playerName: cleanName },
      (res: {
        success: boolean;
        player?: MultiplayerPlayer;
        summary?: LobbySummary;
        error?: string;
      }) => {
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
          <Stack spacing={3} sx={{ width: 'min(550px, 90vw)' }}>
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
                      icon={<LoginIcon />}
                      onClick={handleJoin}
                      disabled={
                        isLoading || !roomId.trim() || !playerName.trim()
                      }
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
          <Button fitContent icon={<ArrowBackIcon />}>
            Voltar
          </Button>
        </Link>
      </main>
    </>
  );
};

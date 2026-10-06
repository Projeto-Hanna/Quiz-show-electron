import {
  Box,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { Link } from 'react-router-dom';

import {
  Button,
  Divider,
  Menu,
  Subtitle,
  Title,
  Text,
  TimePerQuestionSelector,
} from '../components';
import { useSettings } from '../context/useSettings';

export const Settings = () => {
  const {
    settings: {
      timePerQuestionInSeconds,
      unansweredQuestionBehavior,
      multiplayerAllAnsweredBehavior,
    },
    updateSettings,
  } = useSettings();

  const handleTimeChange = (value: number) => {
    updateSettings({ timePerQuestionInSeconds: value });
  };

  const handleUnansweredBehaviorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value as 'next-question' | 'victory-screen';

    updateSettings({ unansweredQuestionBehavior: value });
  };

  const handleMultiplayerAllAnsweredChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value as 'next-question' | 'wait-timer';

    updateSettings({ multiplayerAllAnsweredBehavior: value });
  };

  return (
    <>
      <main>
        <Menu direction="column" gap="30px" sx={{ maxWidth: '800px' }}>
          <Title>Configurações</Title>

          <TimePerQuestionSelector
            value={timePerQuestionInSeconds}
            onChange={handleTimeChange}
          />

          <Divider color="light" />

          <Paper
            elevation={3}
            sx={{
              paddingX: { xs: 2, sm: 6 },
              paddingY: 2,
            }}
          >
            <Subtitle>Comportamento (Singleplayer)</Subtitle>
            <Text variant="h5" color="text.secondary">
              Escolha o que deve acontecer quando o tempo acabar e ninguém
              responder à pergunta.
            </Text>

            <FormControl>
              <RadioGroup
                name="unanswered-question-behavior"
                value={unansweredQuestionBehavior}
                onChange={handleUnansweredBehaviorChange}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1 },
                }}
              >
                <FormControlLabel
                  value="next-question"
                  control={
                    <Radio
                      sx={{
                        color: pink[500],
                        '&.Mui-checked': {
                          color: pink[500],
                        },
                      }}
                    />
                  }
                  label={
                    <Text variant="h6" color="black" fontWeight="regular">
                      Pular para a próxima pergunta
                    </Text>
                  }
                />
                <FormControlLabel
                  value="victory-screen"
                  control={
                    <Radio
                      sx={{
                        color: pink[500],
                        '&.Mui-checked': {
                          color: pink[500],
                        },
                      }}
                    />
                  }
                  label={
                    <Text variant="h6" color="black" fontWeight="regular">
                      Ir direto para a tela de vitória
                    </Text>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          <Divider color="light" />

          <Paper
            elevation={3}
            sx={{
              paddingX: { xs: 2, sm: 6 },
              paddingY: 2,
            }}
          >
            <Subtitle>Todos Responderam (Multiplayer)</Subtitle>
            <Text variant="h5" color="text.secondary">
              Escolha o que deve acontecer quando todos os jogadores responderem
              à pergunta antes do tempo da rodada terminar.
            </Text>

            <FormControl>
              <RadioGroup
                name="multiplayer-all-answered-behavior"
                value={multiplayerAllAnsweredBehavior}
                onChange={handleMultiplayerAllAnsweredChange}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, },
                }}
              >
                <FormControlLabel
                  value="wait-timer"
                  control={
                    <Radio
                      sx={{
                        color: pink[500],
                        '&.Mui-checked': {
                          color: pink[500],
                        },
                      }}
                    />
                  }
                  label={
                    <Text variant="h6" color="black" fontWeight="regular">
                      Aguardar o tempo acabar
                    </Text>
                  }
                />
                <FormControlLabel
                  value="next-question"
                  control={
                    <Radio
                      sx={{
                        color: pink[500],
                        '&.Mui-checked': {
                          color: pink[500],
                        },
                      }}
                    />
                  }
                  label={
                    <Text variant="h6" color="black" fontWeight="regular">
                      Pular para a próxima pergunta
                    </Text>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          <Divider color="light" />

          <Paper
            elevation={3}
            sx={{
              paddingX: { xs: 2, sm: 6 },
              paddingY: 2,
            }}
          >
            <Subtitle>Servidor (Multiplayer)</Subtitle>
            <Text variant="h5" color="text.secondary">
              Endereço do servidor dedicado Socket.IO. Se você hospedar o
              backend na nuvem (ex: Render, Railway, AWS), insira a URL aqui.
            </Text>
            <Box mt={2}>
              <input
                type="text"
                defaultValue={localStorage.getItem('quiz_server_url') || ''}
                placeholder="Padrão: http://localhost:3001"
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val) {
                    localStorage.setItem('quiz_server_url', val);
                  } else {
                    localStorage.removeItem('quiz_server_url');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
              />
            </Box>
          </Paper>
        </Menu>

        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};

import { useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { Link } from 'react-router-dom';

import {
  Button,
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

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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
        <Menu direction="column" gap="30px" sx={{ maxWidth: '800px', width: '100%' }}>
          <Title>Configurações</Title>

          <Paper
            elevation={3}
            sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': { fontWeight: 'bold' },
                  '& .MuiTab-root.Mui-selected': { color: '#b80047 !important' },
                  '& .MuiTabs-indicator': { backgroundColor: '#b80047' },
                }}
              >
                <Tab label="Geral" />
                <Tab label="Singleplayer" />
                <Tab label="Multiplayer" />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {tabIndex === 0 && (
                <TimePerQuestionSelector
                  value={timePerQuestionInSeconds}
                  onChange={handleTimeChange}
                />
              )}

              {tabIndex === 1 && (
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{
                    paddingX: { xs: 2, sm: 6 },
                    paddingY: 2,
                    borderColor: 'rgba(0,0,0,0.1)'
                  }}
                >
                  <Subtitle>Comportamento</Subtitle>
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
              )}

              {tabIndex === 2 && (
                <Stack spacing={3}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      paddingX: { xs: 2, sm: 6 },
                      paddingY: 2,
                      borderColor: 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <Subtitle>Todos Responderam</Subtitle>
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
                          gap: { xs: 1 },
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

                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      paddingX: { xs: 2, sm: 6 },
                      paddingY: 2,
                      borderColor: 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <Subtitle>Servidor</Subtitle>
                    <Text variant="h5" color="text.secondary">
                      Endereço do servidor dedicado Socket.IO. Se você hospedar o
                      backend na nuvem (ex: Render, Railway, AWS), insira a URL aqui.
                    </Text>
                    <Box mt={2}>
                      <input
                        type="text"
                        disabled={!!import.meta.env.VITE_SERVER_URL}
                        defaultValue={
                          import.meta.env.VITE_SERVER_URL ||
                          localStorage.getItem('quiz_server_url') ||
                          ''
                        }
                        placeholder="Padrão: http://localhost:3001"
                        onChange={(e) => {
                          if (import.meta.env.VITE_SERVER_URL) return;
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
                          backgroundColor: import.meta.env.VITE_SERVER_URL
                            ? '#f5f5f5'
                            : 'white',
                          color: import.meta.env.VITE_SERVER_URL
                            ? '#888'
                            : 'inherit',
                          cursor: import.meta.env.VITE_SERVER_URL
                            ? 'not-allowed'
                            : 'text',
                        }}
                      />
                      {!!import.meta.env.VITE_SERVER_URL && (
                        <Text variant="body2" color="error" sx={{ mt: 1 }}>
                          A URL oficial do servidor está fixada via variável de
                          ambiente e não pode ser alterada.
                        </Text>
                      )}
                    </Box>
                  </Paper>
                </Stack>
              )}
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

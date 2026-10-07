import { Link } from 'react-router-dom';

import { Button, Divider, Menu, Subtitle, Text, Title } from '../components';
import { Box, List, ListItem, ListItemText, Paper } from '@mui/material';

export const HowToPlay = () => {
  return (
    <>
      <main>
        <Menu direction="column">
          <Title>Como jogar</Title>
          <Paper
            elevation={3}
            sx={{
              paddingX: { xs: 2, sm: 6 },
              paddingY: 4,
              maxWidth: 720,
            }}
          >
            <Box
              display="flex"
              gap="10px"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="left"
            >
              <Subtitle>Criar uma partida</Subtitle>
              <Text variant="h5">
                Para iniciar uma partida, existem duas opções:
              </Text>
              <List sx={{ listStyleType: 'disc', padding: 0 }}>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <>
                        <Text variant="h5" fontWeight="bold">
                          Iniciar uma partida teste:
                        </Text>
                        <Text variant="h6" color="black" fontWeight="regular">
                          Você jogará com perguntas pré-programadas para testar
                          e se acostumar com o sistema.{' '}
                          <Text
                            variant="h6"
                            color="black"
                            sx={{ display: 'inline' }}
                          >
                            Não é necessário configurar a partida para começar.
                          </Text>
                        </Text>
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <>
                        <Text variant="h5" fontWeight="bold">
                          Iniciar uma partida personalizada:
                        </Text>
                        <Box display="flex" flexDirection="column" gap="12px">
                          <Text variant="h6" color="black" fontWeight="regular">
                            Aqui você precisa{' '}
                            <Text
                              variant="h6"
                              color="black"
                              sx={{ display: 'inline' }}
                            >
                              carregar um arquivo JSON
                            </Text>{' '}
                            com as perguntas no formato esperado pelo programa,{' '}
                            <Text
                              variant="h6"
                              color="black"
                              sx={{ display: 'inline' }}
                            >
                              ou cadastrar suas perguntas via formulário
                            </Text>
                            .
                          </Text>
                          <Text variant="h6" color="black" fontWeight="regular">
                            Cadastre pelo menos uma pergunta, com pelo menos
                            duas opções de resposta. Para selecionar a resposta
                            da pergunta,{' '}
                            <Text
                              variant="h6"
                              color="black"
                              sx={{ display: 'inline' }}
                            >
                              ative o bullet point ao lado da opção escolhida
                            </Text>
                            .
                          </Text>
                          <Text variant="h6" color="black" fontWeight="regular">
                            Você pode baixar as perguntas cadastradas no
                            formulário como JSON para reutilizá-las
                            posteriormente.
                          </Text>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </List>
              <Text variant="h5">
                Para ambos os tipos de partida, você pode definir alguns
                comportamentos na página{' '}
                <Link to="/settings" style={{ display: 'inline' }}>
                  <Text
                    variant="h5"
                    fontWeight="bold"
                    sx={{ display: 'inline', textDecoration: 'underline' }}
                  >
                    "Configurações"
                  </Text>
                </Link>
                .
              </Text>
            </Box>
          </Paper>
          <Divider color="light" />
          <Paper
            elevation={3}
            sx={{
              paddingX: { xs: 2, sm: 6 },
              paddingY: 4,
              maxWidth: 720,
            }}
          >
            <Box
              display="flex"
              gap="10px"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="left"
            >
              <Subtitle>Jogar uma partida (Modo Local)</Subtitle>
              <Text variant="h5">
                Ao começar uma partida no modo local, o jogo funcionará da
                seguinte forma:
              </Text>
              <List sx={{ listStyleType: 'disc', padding: 0 }}>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        Você terá alguns segundos para responder a cada
                        pergunta. Esse tempo pode ser definido na página de
                        configurações.
                      </Text>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        <Text
                          variant="h6"
                          color="black"
                          fontWeight="bold"
                          sx={{ display: 'inline' }}
                        >
                          Ao não responder uma pergunta no tempo determinado
                        </Text>
                        , uma das duas situações acontecerá:
                        <List sx={{ listStyleType: 'circle', padding: 0 }}>
                          <ListItem sx={{ display: 'list-item' }}>
                            <ListItemText
                              primary={
                                <Text variant="h6">
                                  Você passará diretamente para a tela de
                                  encerramento da partida;
                                </Text>
                              }
                            />
                          </ListItem>
                          <ListItem sx={{ display: 'list-item' }}>
                            <ListItemText
                              primary={
                                <Text variant="h6">
                                  Você passará para a próxima pergunta, se
                                  houver. Se não houver, irá para a tela de
                                  encerramento.
                                </Text>
                              }
                            />
                          </ListItem>
                        </List>
                        A escolha desse comportamento também é definida na
                        página de configurações.
                      </Text>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        <Text
                          variant="h6"
                          color="black"
                          fontWeight="bold"
                          sx={{ display: 'inline' }}
                        >
                          Ao acertar uma pergunta no modo local, você receberá
                          100 pontos fixos. Ao errar, receberá 0.
                        </Text>{' '}
                        Em ambos os casos, passará para a próxima pergunta, se
                        houver, ou para a tela de encerramento, se acabar a
                        partida.
                      </Text>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        Na tela de encerramento, você verá sua pontuação, as
                        respostas para cada pergunta, e a sua escolha nelas.
                      </Text>
                    }
                  />
                </ListItem>
              </List>
              <Text variant="h5" textAlign="center">
                Se necessário, jogue as partidas teste para poder se acostumar.
              </Text>
            </Box>
          </Paper>
          <Divider color="light" />
          <Paper
            elevation={3}
            sx={{
              paddingX: { xs: 2, sm: 6 },
              paddingY: 4,
              maxWidth: 720,
            }}
          >
            <Box
              display="flex"
              gap="10px"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="left"
            >
              <Subtitle>Modo Multiplayer</Subtitle>
              <Text variant="h5">
                Regras específicas para jogar online com seus amigos:
              </Text>
              <List sx={{ listStyleType: 'disc', padding: 0 }}>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        <Text
                          variant="h6"
                          color="black"
                          fontWeight="bold"
                          sx={{ display: 'inline' }}
                        >
                          Limites da Sala:
                        </Text>{' '}
                        As salas multiplayer suportam até 10 jogadores e um
                        limite máximo de 100 perguntas por partida.
                      </Text>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        <Text
                          variant="h6"
                          color="black"
                          fontWeight="bold"
                          sx={{ display: 'inline' }}
                        >
                          Entrando na Sala:
                        </Text>{' '}
                        Para participar, o jogador deve inserir o código de 6
                        letras gerado para o Host.
                      </Text>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  <ListItemText
                    primary={
                      <Text variant="h6" color="black" fontWeight="regular">
                        <Text
                          variant="h6"
                          color="black"
                          fontWeight="bold"
                          sx={{ display: 'inline' }}
                        >
                          Bônus de Velocidade:
                        </Text>{' '}
                        Diferente do modo local, acertar uma pergunta te dá 100
                        pontos base + até 50 pontos de bônus, proporcionais à
                        rapidez da sua resposta. Quem responde mais rápido,
                        pontua mais!
                      </Text>
                    }
                  />
                </ListItem>
              </List>
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

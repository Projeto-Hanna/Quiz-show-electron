# Quiz Show - Projeto Hanna (Frontend / Desktop)

Quiz Show desenvolvido e utilizado para o **Projeto Hanna**. Desenvolvido utilizando a stack **Electron** com **Vite** e **React** para fornecer uma interface gráfica servindo tanto para partidas locais quanto multiplayer.

Este repositório contém apenas a aplicação Frontend (o cliente). O servidor multiplayer responsável pelo fluxo de mensagens via WebSockets encontra-se em **[https://github.com/Projeto-Hanna/Quiz-show-API](https://github.com/Projeto-Hanna/Quiz-show-API)**.

---

## 🛠 Principais Tecnologias e Dependências

- **Electron**: Framework base para construir o aplicativo desktop multiplataforma.
- **Vite** (`electron-vite`): Ferramenta de build super rápida para o React e processos do Electron.
- **React** (`react`, `react-dom`, `react-router-dom`): Biblioteca para construção da interface gráfica.
- **Material UI** (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`): Sistema de design e biblioteca de componentes utilizada para a estilização da interface.
- **Socket.io Client** (`socket.io-client`): Cliente WebSocket utilizado para a comunicação em tempo real com a API Multiplayer.
- **TypeScript**: Linguagem base do projeto para garantir tipagem estática e segurança.

---

## 🚀 Scripts Disponíveis

Este projeto utiliza npm/yarn. Você tem os seguintes comandos à disposição através do `package.json`:

| Script | Descrição |
|--------|-------------|
| `npm run dev` | Inicia a aplicação no modo de desenvolvimento, abrindo a janela do Electron com Hot-Reload ativado. |
| `npm run build` | Faz a compilação e build da aplicação (gera a pasta `out`). Necessário antes de empacotar. |
| `npm run preview` | Inicia o Electron usando os arquivos cacheados do build de produção (para teste). |
| `npm run package` | Realiza o build e então empacota a aplicação nos formatos padrão do seu sistema operacional (`electron-builder`). |
| `npm run make` | Atalho semelhante ao `package` para gerar os binários executáveis. |
| `npm run build:win` | Força a compilação e o empacotamento do executável especificamente para **Windows** (gera o instalador `.exe`). |
| `npm run lint` | Executa o ESLint para encontrar problemas no código fonte. |
| `npm run format` | Executa o Prettier para formatar automaticamente todos os arquivos. |

---

## 🔐 Variáveis de Ambiente

Para que o multiplayer funcione corretamente em rede, a aplicação precisa saber onde o servidor (API backend) está hospedado. 

Crie um arquivo `.env` na raiz deste projeto com as seguintes variáveis (opcional, o sistema possui fallbacks automáticos):

```env
# Define a URL do servidor backend WebSocket. 
# Se não for preenchida, o app tentará usar a rede local (ex: http://localhost:3001) ou a URL salva manualmente nas configurações do app.
VITE_SERVER_URL=http://localhost:3001
```

> **Nota:** Como esta é uma aplicação Vite, todas as variáveis de ambiente que precisam ser acessadas pelo Frontend (`renderer`) devem, obrigatoriamente, ser prefixadas com `VITE_`.

---

## 💻 Como Rodar o Projeto (Desenvolvimento)

1. Certifique-se de ter o Node.js instalado.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
   ou
   ```bash
   yarn install
   ```
3. Crie o arquivo `.env` (opcional) caso a API esteja rodando em um endereço diferente.
4. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

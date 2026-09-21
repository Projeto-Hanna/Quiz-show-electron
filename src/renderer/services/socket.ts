import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getDefaultServerUrl = (): string => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  const host =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : 'localhost';

  return `http://${host}:3001`;
};

export const getSocket = (serverUrl?: string): Socket => {
  const url =
    serverUrl ||
    localStorage.getItem('quiz_server_url') ||
    getDefaultServerUrl();

  if (!socket || !socket.connected) {
    if (socket) {
      socket.disconnect();
    }
    socket = io(url, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

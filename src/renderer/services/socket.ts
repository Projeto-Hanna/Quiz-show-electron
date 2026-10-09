import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export type ServerStatus = 'idle' | 'waking' | 'online' | 'offline';

let currentServerStatus: ServerStatus = 'idle';
const statusListeners = new Set<(status: ServerStatus) => void>();
let activeWakePromise: Promise<boolean> | null = null;

export const getServerUrl = (overrideUrl?: string): string => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  const host =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : 'localhost';
  const defaultUrl = `http://${host}:3001`;

  return (
    overrideUrl ||
    localStorage.getItem('quiz_server_url') ||
    defaultUrl
  );
};

export const getServerStatus = (): ServerStatus => currentServerStatus;

const notifyStatus = (newStatus: ServerStatus) => {
  currentServerStatus = newStatus;
  statusListeners.forEach((listener) => {
    try {
      listener(newStatus);
    } catch (err) {
      console.error(
        '[ServerStatus] Erro ao notificar listener de status:',
        err,
      );
    }
  });
};

export const subscribeServerStatus = (
  listener: (status: ServerStatus) => void,
): (() => void) => {
  statusListeners.add(listener);
  listener(currentServerStatus);
  return () => {
    statusListeners.delete(listener);
  };
};

export const wakeUpServer = async (force = false): Promise<boolean> => {
  if (!force && currentServerStatus === 'online') {
    return true;
  }

  if (socket?.connected) {
    notifyStatus('online');
    return true;
  }

  if (activeWakePromise) {
    return activeWakePromise;
  }

  const url = getServerUrl();
  if (!url) {
    console.warn('[ServerWakeUp] Nenhuma URL de servidor configurada.');
    notifyStatus('offline');
    return false;
  }

  notifyStatus('waking');

  activeWakePromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const targetUrl = `${url.replace(/\/$/, '')}/health`;
      let isSuccess = false;

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (response.ok) {
          isSuccess = true;
        } else {
          console.warn(
            `[ServerWakeUp] Servidor retornou resposta inesperada (${targetUrl}): ${response.status} ${response.statusText}`,
          );
        }
      } catch (fetchErr) {
        console.warn(
          `[ServerWakeUp] Não foi possível conectar ao servidor em ${url}:`,
          fetchErr instanceof Error ? fetchErr.message : fetchErr,
        );
      }

      clearTimeout(timeoutId);

      if (isSuccess || socket?.connected) {
        notifyStatus('online');
        return true;
      } else {
        notifyStatus('offline');
        return false;
      }
    } catch (error) {
      console.warn(
        `[ServerWakeUp] Erro geral ao tentar despertar o servidor em ${url}:`,
        error instanceof Error ? error.message : error,
      );
      notifyStatus('offline');
      return false;
    } finally {
      activeWakePromise = null;
    }
  })();

  return activeWakePromise;
};

export const getSocket = (serverUrl?: string): Socket => {
  const url = getServerUrl(serverUrl);

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

    socket.on('connect', () => {
      notifyStatus('online');
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket.IO] Desconectado do servidor (${url}):`, reason);
      notifyStatus('offline');
    });

    socket.on('connect_error', (error) => {
      console.warn(
        `[Socket.IO] Falha na conexão com o servidor (${url}):`,
        error.message || error,
      );
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    notifyStatus('offline');
  }
};

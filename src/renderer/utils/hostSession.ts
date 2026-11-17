const LEGACY_HOST_TOKEN_KEY = 'quiz_host_token';

const hostTokenKey = (roomId: string) =>
  `quiz_host_token_${roomId.toUpperCase()}`;

export const getHostToken = (roomId: string | undefined): string | null => {
  if (!roomId) return null;
  const key = hostTokenKey(roomId);
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

export const saveHostToken = (roomId: string, hostToken: string): void => {
  const key = hostTokenKey(roomId);
  sessionStorage.setItem(key, hostToken);
  localStorage.setItem(key, hostToken);
  sessionStorage.removeItem(LEGACY_HOST_TOKEN_KEY);
  localStorage.removeItem(LEGACY_HOST_TOKEN_KEY);
};

export const clearHostToken = (roomId: string | undefined): void => {
  if (!roomId) return;
  const key = hostTokenKey(roomId);
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

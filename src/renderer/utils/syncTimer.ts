import type { RoomSyncState } from '../types';

/**
 * Computes the local deadline (in this device's clock) and remaining seconds of
 * the active question from a server sync payload.
 *
 * Prefers the server-computed `remainingMs`, which is immune to clock skew
 * between this device and the server. Falls back to `startedAt` for older servers.
 */
export const getSyncCountdown = (
  sync: RoomSyncState,
): { deadline: number; remainingSeconds: number } => {
  const question = sync.currentQuestion;
  const limitSec = question?.timeLimit || 15;
  const limitMs = limitSec * 1000;

  let remainingMs: number;
  if (typeof sync.remainingMs === 'number') {
    remainingMs = sync.remainingMs;
  } else if (question?.startedAt) {
    remainingMs = limitMs - (Date.now() - question.startedAt);
  } else {
    remainingMs = limitMs;
  }

  remainingMs = Math.min(limitMs, Math.max(0, remainingMs));

  return {
    deadline: Date.now() + remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
};

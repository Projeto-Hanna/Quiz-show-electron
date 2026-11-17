import { useCallback, useRef, useState } from 'react';
import type { LobbyCounts, MultiplayerPlayer } from '../types';

/**
 * Roster events sent by the server. They carry only the changed player plus the
 * room counts; the full list arrives once, in the join / rejoin callback.
 * A full `summary.players` is still accepted (and replaces the list) if present.
 */
export type RosterEvent =
  | {
      type: 'joined';
      player: MultiplayerPlayer;
      summary: LobbyCounts & { players?: MultiplayerPlayer[] };
    }
  | {
      type: 'left';
      player: MultiplayerPlayer;
      summary: LobbyCounts & { players?: MultiplayerPlayer[] };
    }
  | {
      type: 'connection';
      playerId: string;
      connected: boolean;
      summary: LobbyCounts & { players?: MultiplayerPlayer[] };
    };

export const upsertPlayer = (
  list: MultiplayerPlayer[],
  player: MultiplayerPlayer,
): MultiplayerPlayer[] => {
  const index = list.findIndex((p) => p.id === player.id);
  if (index === -1) return [...list, player];
  const next = [...list];
  next[index] = { ...list[index], ...player };
  return next;
};

export const removePlayer = (
  list: MultiplayerPlayer[],
  playerId: string,
): MultiplayerPlayer[] => list.filter((p) => p.id !== playerId);

export const setPlayerConnected = (
  list: MultiplayerPlayer[],
  playerId: string,
  connected: boolean,
): MultiplayerPlayer[] =>
  list.map((p) => (p.id === playerId ? { ...p, connected } : p));

/**
 * Applies a roster event to the current list.
 * `consistent` is false when the result doesn't match the server's player count,
 * meaning an event was missed and the caller should fetch the full list again.
 */
export const applyRosterEvent = (
  list: MultiplayerPlayer[],
  event: RosterEvent,
): { list: MultiplayerPlayer[]; consistent: boolean } => {
  let next: MultiplayerPlayer[];

  if (Array.isArray(event.summary?.players)) {
    next = event.summary.players;
  } else if (event.type === 'joined') {
    next = upsertPlayer(list, event.player);
  } else if (event.type === 'left') {
    next = removePlayer(list, event.player.id);
  } else {
    next = setPlayerConnected(list, event.playerId, event.connected);
  }

  const expected = event.summary?.playerCount;
  const consistent = typeof expected !== 'number' || next.length === expected;
  return { list: next, consistent };
};

/**
 * Keeps the lobby roster in state and in a ref at the same time, so incremental
 * events are always applied on top of the latest list (even before a re-render).
 */
export const useLobbyRoster = (initialPlayers: MultiplayerPlayer[] = []) => {
  const [players, setPlayers] = useState<MultiplayerPlayer[]>(initialPlayers);
  const playersRef = useRef<MultiplayerPlayer[]>(initialPlayers);

  const replacePlayers = useCallback((list: MultiplayerPlayer[]) => {
    playersRef.current = list;
    setPlayers(list);
  }, []);

  /** Returns false when the roster went out of sync and needs a full refresh. */
  const applyEvent = useCallback((event: RosterEvent): boolean => {
    const { list, consistent } = applyRosterEvent(playersRef.current, event);
    playersRef.current = list;
    setPlayers(list);
    return consistent;
  }, []);

  return { players, playersRef, replacePlayers, applyEvent };
};

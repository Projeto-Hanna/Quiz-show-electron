import { createContext } from 'react';

export type Settings = {
  timePerQuestionInSeconds: number;
  unansweredQuestionBehavior: 'next-question' | 'victory-screen';
  multiplayerAllAnsweredBehavior: 'next-question' | 'wait-timer';
};

export type SettingsContextValue = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
};

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

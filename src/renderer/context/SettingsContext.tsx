import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  SettingsContext,
  type Settings,
  type SettingsContextValue,
} from './internalSettingsContext';

const DEFAULT_SETTINGS: Settings = {
  timePerQuestionInSeconds: 15,
  unansweredQuestionBehavior: 'next-question',
};

const STORAGE_KEY = 'quiz-show-settings';

type Props = {
  children: ReactNode;
};

export const SettingsProvider = ({ children }: Props) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;

      const parsed = JSON.parse(raw) as Partial<Settings>;

      if (
        typeof parsed.timePerQuestionInSeconds === 'number' &&
        Number.isFinite(parsed.timePerQuestionInSeconds)
      ) {
        return {
          timePerQuestionInSeconds: parsed.timePerQuestionInSeconds,
          unansweredQuestionBehavior:
            parsed.unansweredQuestionBehavior ??
            DEFAULT_SETTINGS.unansweredQuestionBehavior,
        };
      }

      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings,
    }),
    [settings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

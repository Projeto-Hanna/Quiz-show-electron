import { useCallback, useEffect, useRef, useState } from 'react';

export const useAutoRedirect = (
  active: boolean,
  seconds: number,
  onExpire: () => void,
) => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!active || isCancelled) return;

    const deadline = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        onExpireRef.current();
      }
    }, 250);

    return () => {
      clearInterval(timer);
      setRemaining(null);
    };
  }, [active, isCancelled, seconds]);

  const cancel = useCallback(() => setIsCancelled(true), []);

  return {
    remainingSeconds: remaining ?? seconds,
    isCancelled,
    cancel,
  };
};

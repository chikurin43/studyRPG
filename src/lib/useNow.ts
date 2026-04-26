import { useEffect, useState } from "react";

export function useNow(intervalMs = 1_000) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, intervalMs);

    return () => window.clearInterval(timerId);
  }, [intervalMs]);

  return nowMs;
}

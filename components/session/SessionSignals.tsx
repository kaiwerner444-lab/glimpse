"use client";

// Per-session live signal store. The extractor publishes detections here
// (current task tap count, latest face symmetry, etc.); task UIs subscribe
// to render them. Decouples ML extraction from rendering — extractors
// don't know about React, components don't know about MediaPipe.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface SessionSignals {
  liveTapCount: number;
}

interface SessionSignalsCtxValue extends SessionSignals {
  publishTap: () => void;
  resetSignals: () => void;
}

const Ctx = createContext<SessionSignalsCtxValue | null>(null);

export function SessionSignalsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [liveTapCount, setLiveTapCount] = useState(0);
  // Refs so callbacks remain stable across renders.
  const tapsRef = useRef(0);

  const publishTap = useCallback(() => {
    tapsRef.current += 1;
    setLiveTapCount(tapsRef.current);
  }, []);

  const resetSignals = useCallback(() => {
    tapsRef.current = 0;
    setLiveTapCount(0);
  }, []);

  const value = useMemo(
    () => ({ liveTapCount, publishTap, resetSignals }),
    [liveTapCount, publishTap, resetSignals],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSessionSignals(): SessionSignalsCtxValue {
  const v = useContext(Ctx);
  if (!v) {
    // Safe no-op fallback so the FingerTapTask still works outside a session.
    return {
      liveTapCount: 0,
      publishTap: () => undefined,
      resetSignals: () => undefined,
    };
  }
  return v;
}

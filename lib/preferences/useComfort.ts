"use client";

import { useEffect, useState } from "react";
import {
  loadComfort,
  resolveComfort,
  type ComfortPreference,
} from "./comfort";
import { loadOnboarding } from "@/lib/db/mock-db";

// React hook that returns the live comfort-mode flag plus its raw
// preference value, so components can react to changes in settings.
export function useComfort(): {
  pref: ComfortPreference;
  enabled: boolean;
} {
  const [pref, setPref] = useState<ComfortPreference>("auto");
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    function sync() {
      const next = loadComfort();
      setPref(next);
      const state = loadOnboarding();
      setEnabled(resolveComfort(next, state.account ?? null));
    }
    sync();
    // Listen for changes in other tabs OR programmatic saves in this tab.
    window.addEventListener("storage", sync);
    window.addEventListener("glimpse-comfort-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("glimpse-comfort-change", sync);
    };
  }, []);

  return { pref, enabled };
}

// Notify in-tab listeners of comfort changes. Settings page calls this
// after saveComfort so the dashboard updates without a refresh.
export function broadcastComfortChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("glimpse-comfort-change"));
}

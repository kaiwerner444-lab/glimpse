"use client";

// Client-side auth gate. Used by /home, /settings, /reports, /session/daily
// to bounce unauthenticated visitors to /auth/signin. The mock backend
// checks localStorage; when Supabase is wired in v2, this swaps to
// sb.auth.getSession() with a real onAuthStateChange subscription.

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentAccount } from "./mock-auth";

export function useRequireAuth(): boolean {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const acc = getCurrentAccount();
    if (!acc) {
      const redirect = encodeURIComponent(pathname || "/home");
      router.replace(`/auth/signin?redirect=${redirect}`);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  return ready;
}

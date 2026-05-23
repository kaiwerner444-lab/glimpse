"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User } from "lucide-react";
import { signOut, getCurrentAccount } from "@/lib/auth/mock-auth";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  className?: string;
}

export function AccountMenu({ className }: AccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const acc = getCurrentAccount();
    if (acc) setEmail(acc.email);
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = email
    ? email
        .split("@")[0]
        .split(/[._-]/)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2) || "Y"
    : "Y";

  const onSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className={cn(
          "h-9 w-9 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center hover:bg-brand-600 transition shadow-card",
          open && "ring-2 ring-brand-500/40 ring-offset-2 ring-offset-surface-alt",
        )}
      >
        {initials || <User className="h-4 w-4" />}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface shadow-card border border-black/[0.06] overflow-hidden z-40 animate-fade-up"
        >
          <div className="px-4 py-3 border-b border-black/[0.06]">
            <p className="text-xs text-ink-subtle uppercase tracking-wider font-medium">
              Signed in as
            </p>
            <p
              className="text-sm font-medium text-ink truncate"
              title={email}
            >
              {email || "Local session"}
            </p>
          </div>
          <div className="py-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-black/[0.04]"
            >
              <Settings className="h-4 w-4 text-ink-muted" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-alert/10 hover:text-alert"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Sunrise,
  FileText,
  Users,
  AlertTriangle,
  Settings,
  LogOut,
  Stethoscope,
  Activity,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getCurrentAccount,
  signOut,
} from "@/lib/auth/mock-auth";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  // 'dashboard' = full app nav (sessions, settings, sign out).
  // 'landing'   = just public nav (clinicians, sign in, get started).
  variant?: "dashboard" | "landing";
  ctaHref?: string; // For the landing variant
}

interface Item {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  divider?: boolean;
}

export function MobileMenu({ variant = "dashboard", ctaHref }: MobileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const acc = getCurrentAccount();
    if (acc) setEmail(acc.email);
  }, []);

  // Close on outside click + Esc.
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

  // Lock body scroll while open so the sheet feels like a real panel.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const firstName = email
    ? (() => {
        const local = email.split("@")[0].split(/[._-]/)[0] ?? "";
        return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
      })()
    : "";
  const initials = firstName
    ? firstName.charAt(0) + (email.split("@")[0].split(/[._-]/)[1]?.charAt(0) ?? "")
    : "Y";

  const onSignOut = async () => {
    await signOut();
    setOpen(false);
    router.push("/");
  };

  const items: Item[] =
    variant === "dashboard"
      ? [
          { href: "/session/daily", label: "Today's session", icon: <Sunrise className="h-4 w-4" /> },
          { href: "/sessions", label: "Session history", icon: <Activity className="h-4 w-4" /> },
          { href: "/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
          { href: "/alerts", label: "Alerts", icon: <AlertTriangle className="h-4 w-4" /> },
          { href: "/family", label: "Family access", icon: <Users className="h-4 w-4" /> },
          { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
          { divider: true, label: "" },
          { href: "/clinician", label: "For clinicians", icon: <Stethoscope className="h-4 w-4" /> },
          { label: "Sign out", icon: <LogOut className="h-4 w-4" />, onClick: onSignOut },
        ]
      : [
          { href: "/clinician", label: "For clinicians", icon: <Stethoscope className="h-4 w-4" /> },
          { href: "/auth/signin", label: "Sign in" },
          { divider: true, label: "" },
          {
            href: ctaHref ?? "/onboarding/account",
            label: "Get started",
            primary: true,
          },
        ];

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition border",
          open
            ? "bg-ink text-surface border-ink"
            : "bg-surface text-ink border-black/[0.08] hover:bg-surface-alt",
        )}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* Backdrop — closes the menu when tapped */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 bg-ink/30 backdrop-blur-sm z-30"
              aria-hidden
            />
            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              role="menu"
              className="fixed left-3 right-3 top-[68px] z-40 glimpse-card overflow-hidden"
            >
              {variant === "dashboard" && email ? (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-alt border-b border-black/[0.06]">
                  <span className="h-9 w-9 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {initials.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    {firstName ? (
                      <p className="text-sm font-semibold text-ink leading-tight">
                        {firstName}
                      </p>
                    ) : null}
                    <p
                      className="text-xs text-ink-muted truncate"
                      title={email}
                    >
                      {email || "Local session"}
                    </p>
                  </div>
                </div>
              ) : null}

              <ul className="py-1.5">
                {items.map((item, i) => {
                  if (item.divider) {
                    return (
                      <li
                        key={`d${i}`}
                        aria-hidden
                        className="my-1.5 mx-4 h-px bg-black/[0.06]"
                      />
                    );
                  }
                  if (item.onClick) {
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={item.onClick}
                          role="menuitem"
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-base text-ink hover:bg-alert/10 hover:text-alert transition-colors"
                        >
                          {item.icon ? (
                            <span className="text-ink-muted">{item.icon}</span>
                          ) : null}
                          <span className="flex-1">{item.label}</span>
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href ?? "#"}
                        onClick={() => setOpen(false)}
                        role="menuitem"
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-base transition-colors",
                          item.primary
                            ? "bg-brand-500 text-white hover:bg-brand-600 mx-3 my-2 rounded-xl font-semibold"
                            : "text-ink hover:bg-black/[0.04]",
                        )}
                      >
                        {item.icon ? (
                          <span
                            className={cn(
                              item.primary ? "text-white/80" : "text-ink-muted",
                            )}
                          >
                            {item.icon}
                          </span>
                        ) : null}
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

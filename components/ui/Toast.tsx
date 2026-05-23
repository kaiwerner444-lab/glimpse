"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "info" | "success" | "error";
interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
}

interface ToastApi {
  push: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<ToastApi | null>(null);

// Mounted in app/layout.tsx so any component can call useToast().push.
// Stacks bottom-right, max 4 visible, auto-dismisses after 5s.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((t: Omit<Toast, "id">) => {
    counter.current += 1;
    const id = `t${counter.current}`;
    setItems((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 max-w-sm">
        {items.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  return v ?? { push: () => undefined };
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const meta = {
    info: { icon: <Info className="h-4 w-4" />, bg: "bg-brand-500", text: "text-white" },
    success: { icon: <CheckCircle2 className="h-4 w-4" />, bg: "bg-success", text: "text-white" },
    error: { icon: <AlertTriangle className="h-4 w-4" />, bg: "bg-alert", text: "text-white" },
  }[toast.tone];

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto rounded-2xl shadow-elevated p-3 pr-2 flex items-start gap-2 min-w-[260px] animate-subtle-rise",
        meta.bg,
        meta.text,
      )}
    >
      <span className="mt-0.5">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.body ? (
          <p className="text-xs opacity-90 mt-0.5 leading-snug">{toast.body}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="opacity-70 hover:opacity-100 p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

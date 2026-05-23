"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2, Sparkles, Heart, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "neutral" | "gentle";

interface Reaction {
  id: string;
  text: string;
  tone: Tone;
  emoji?: "check" | "sparkle" | "heart" | "smile";
}

interface ReactionContextValue {
  push: (r: Omit<Reaction, "id">) => void;
}

const Ctx = createContext<ReactionContextValue | null>(null);

export function ReactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<Reaction[]>([]);
  const counter = useRef(0);

  const push = useCallback((r: Omit<Reaction, "id">) => {
    counter.current += 1;
    const id = `r${counter.current}`;
    setItems((prev) => [...prev, { ...r, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 1800);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <ReactionLayer items={items} />
    </Ctx.Provider>
  );
}

export function useReactions() {
  const v = useContext(Ctx);
  return v ?? { push: () => undefined };
}

function ReactionLayer({ items }: { items: Reaction[] }) {
  return (
    <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      {items.map((r) => (
        <ReactionToast key={r.id} reaction={r} />
      ))}
    </div>
  );
}

function ReactionToast({ reaction }: { reaction: Reaction }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-full px-4 py-2 shadow-card flex items-center gap-2 text-sm font-medium",
        "animate-reaction-toast",
        reaction.tone === "success" && "bg-success text-white",
        reaction.tone === "neutral" && "bg-brand-500 text-white",
        reaction.tone === "gentle" && "bg-sunrise-400 text-white",
      )}
    >
      {reaction.emoji === "sparkle" && <Sparkles className="h-4 w-4" />}
      {reaction.emoji === "check" && <CheckCircle2 className="h-4 w-4" />}
      {reaction.emoji === "heart" && <Heart className="h-4 w-4 fill-current" />}
      {reaction.emoji === "smile" && <Smile className="h-4 w-4" />}
      <span>{reaction.text}</span>
    </div>
  );
}

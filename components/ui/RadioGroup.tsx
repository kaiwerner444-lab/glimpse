"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioGroupProps<T extends string> {
  value: T | null;
  onChange: (next: T) => void;
  options: RadioOption<T>[];
  name: string;
  layout?: "stack" | "grid";
  className?: string;
}

export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
  name,
  layout = "stack",
  className,
}: RadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
          : "flex flex-col gap-3",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition",
              selected
                ? "border-brand-500 bg-brand-50/60 shadow-card"
                : "border-black/10 bg-surface hover:border-black/20",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-1 h-5 w-5 rounded-full border-2 transition flex items-center justify-center shrink-0",
                selected ? "border-brand-500" : "border-black/25",
              )}
            >
              {selected ? (
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              ) : null}
            </span>
            <span className="flex flex-col gap-1 flex-1">
              <span className="flex items-center gap-2">
                {opt.icon ? <span className="text-brand-500">{opt.icon}</span> : null}
                <span className="text-base font-medium text-ink">
                  {opt.label}
                </span>
              </span>
              {opt.description ? (
                <span className="text-sm text-ink-muted leading-snug">
                  {opt.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

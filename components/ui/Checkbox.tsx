"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  id,
  label,
  hint,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 cursor-pointer",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative inline-flex items-center justify-center mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "h-5 w-5 rounded-md border border-black/20 bg-surface transition",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
            checked && "bg-brand-500 border-brand-500",
          )}
        >
          {checked ? (
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          ) : null}
        </span>
      </span>
      {label || hint ? (
        <span className="flex flex-col gap-0.5">
          {label ? (
            <span className="text-base text-ink leading-snug">{label}</span>
          ) : null}
          {hint ? (
            <span className="text-sm text-ink-muted leading-snug">{hint}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}

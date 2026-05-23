"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-ink"
      >
        {label}
        {required ? <span className="text-brand-500"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-sm text-ink-muted">{hint}</p>
      ) : null}
      {error ? <p className="text-sm text-alert">{error}</p> : null}
    </div>
  );
}

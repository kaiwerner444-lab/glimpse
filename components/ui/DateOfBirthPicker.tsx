"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "./Select";

// Three-select DOB picker. Better than the native calendar widget for
// dates of birth specifically because (a) the calendar grid is a poor
// affordance for picking a year 30-90 years ago, (b) the browser-native
// popup ignores our design system, and (c) keyboard-only users get a
// vastly cleaner experience.
//
// Implementation note: we keep the three parts (year/month/day) in
// internal state and only emit the combined ISO date to the parent
// when all three are set. The previous version emitted "" on any
// partial selection, which meant the parent's value prop went empty
// and the next render wiped whichever part the user had just selected
// — leaving the picker unusable.

interface DateOfBirthPickerProps {
  value: string; // ISO yyyy-mm-dd or ""
  onChange: (value: string) => void;
  id?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, month: number): number {
  // month is 1-12 here
  return new Date(year, month, 0).getDate();
}

function splitIso(value: string): [string, string, string] {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return ["", "", ""];
  const [y, m, d] = value.split("-");
  return [y, m, d];
}

export function DateOfBirthPicker({
  value,
  onChange,
  id,
}: DateOfBirthPickerProps) {
  const [initialYear, initialMonth, initialDay] = useMemo(
    () => splitIso(value),
    [value],
  );
  // Internal partial state. Survives partial selection so the user can
  // pick the three parts in any order without losing the previous ones.
  const [year, setYear] = useState<string>(initialYear);
  const [month, setMonth] = useState<string>(initialMonth);
  const [day, setDay] = useState<string>(initialDay);

  // If the parent overrides the value (e.g. from server state hydration)
  // and our internal state still matches the previous parent value,
  // re-sync. We don't re-sync when the parent value is empty but we
  // have a non-empty internal partial — that would wipe in-progress
  // input.
  useEffect(() => {
    const [y, m, d] = splitIso(value);
    if (y && m && d) {
      if (y !== year) setYear(y);
      if (m !== month) setMonth(m);
      if (d !== day) setDay(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const out: number[] = [];
    // Adult onboarding: 18-120 years old.
    for (let y = currentYear - 18; y >= currentYear - 120; y -= 1) out.push(y);
    return out;
  }, [currentYear]);

  const maxDay = useMemo(() => {
    const y = Number(year) || currentYear;
    const m = Number(month) || 1;
    return daysInMonth(y, m);
  }, [year, month, currentYear]);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    } else {
      onChange("");
    }
  };

  const onMonth = (m: string) => {
    let nextDay = day;
    if (m && year && day) {
      const max = daysInMonth(Number(year), Number(m));
      if (Number(day) > max) nextDay = String(max).padStart(2, "0");
    }
    setMonth(m);
    setDay(nextDay);
    emit(year, m, nextDay);
  };
  const onDay = (d: string) => {
    setDay(d);
    emit(year, month, d);
  };
  const onYear = (y: string) => {
    let nextDay = day;
    if (y && month && day) {
      const max = daysInMonth(Number(y), Number(month));
      if (Number(day) > max) nextDay = String(max).padStart(2, "0");
    }
    setYear(y);
    setDay(nextDay);
    emit(y, month, nextDay);
  };

  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-labelledby={id ? `${id}-label` : undefined}
    >
      <Select
        value={month}
        onChange={(e) => onMonth(e.target.value)}
        aria-label="Month"
      >
        <option value="">Month</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={String(i + 1).padStart(2, "0")}>
            {m}
          </option>
        ))}
      </Select>
      <Select
        value={day}
        onChange={(e) => onDay(e.target.value)}
        aria-label="Day"
      >
        <option value="">Day</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
          <option key={d} value={String(d).padStart(2, "0")}>
            {d}
          </option>
        ))}
      </Select>
      <Select
        value={year}
        onChange={(e) => onYear(e.target.value)}
        aria-label="Year"
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </Select>
    </div>
  );
}

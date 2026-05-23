"use client";

import { useMemo } from "react";
import { Select } from "./Select";

// Three-select DOB picker. Better than the native calendar widget for
// dates of birth specifically because (a) the calendar grid is a poor
// affordance for picking a year 30-90 years ago, (b) the browser-native
// popup ignores our design system, and (c) keyboard-only users get a
// vastly cleaner experience.

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

export function DateOfBirthPicker({
  value,
  onChange,
  id,
}: DateOfBirthPickerProps) {
  const [year, month, day] = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return ["", "", ""] as const;
    }
    const [y, m, d] = value.split("-");
    return [y, m, d] as const;
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const out: number[] = [];
    // 120 years back to cover any adult onboarding case.
    for (let y = currentYear - 18; y >= currentYear - 120; y -= 1) out.push(y);
    return out;
  }, [currentYear]);

  const maxDay = useMemo(() => {
    const y = Number(year) || currentYear;
    const m = Number(month) || 1;
    return daysInMonth(y, m);
  }, [year, month, currentYear]);

  const emit = (y: string, m: string, d: string) => {
    if (!y || !m || !d) {
      onChange("");
      return;
    }
    onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
  };

  const onYear = (y: string) => {
    let dd = day;
    if (y && month && Number(dd) > daysInMonth(Number(y), Number(month))) {
      dd = String(daysInMonth(Number(y), Number(month)));
    }
    emit(y, month, dd);
  };
  const onMonth = (m: string) => {
    let dd = day;
    if (m && year && Number(dd) > daysInMonth(Number(year), Number(m))) {
      dd = String(daysInMonth(Number(year), Number(m)));
    }
    emit(year, m, dd);
  };
  const onDay = (d: string) => {
    emit(year, month, d);
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

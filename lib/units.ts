// Unit conversion + display helpers. Storage is always metric; the
// imperial helpers exist purely so users in the US can enter and read
// values they're used to.

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  // Handle the edge case where rounding pushes us up a foot (e.g. 5'12").
  if (inches === 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function formatHeight(cm: number, system: "metric" | "imperial"): string {
  if (system === "imperial") {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

export function formatWeight(kg: number, system: "metric" | "imperial"): string {
  if (system === "imperial") return `${kgToLbs(kg)} lb`;
  return `${kg} kg`;
}

// Connection state for external sensor integrations. localStorage-backed
// in v1; in v2 each entry holds a real OAuth refresh token / partner
// API credential and is mirrored to Supabase per-user.

"use client";

export interface SensorConnection {
  sensorId: string;
  connectedAt: string;
  // For real integrations this would be an opaque vendor user id.
  externalUserId?: string;
}

const STORAGE_KEY = "glimpse.sensor-connections";

export function loadConnections(): SensorConnection[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SensorConnection[];
  } catch {
    return [];
  }
}

export function saveConnections(items: SensorConnection[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function connect(sensorId: string): SensorConnection[] {
  const next = [
    { sensorId, connectedAt: new Date().toISOString() },
    ...loadConnections().filter((c) => c.sensorId !== sensorId),
  ];
  saveConnections(next);
  return next;
}

export function disconnect(sensorId: string): SensorConnection[] {
  const next = loadConnections().filter((c) => c.sensorId !== sensorId);
  saveConnections(next);
  return next;
}

"use client";

import { useEffect, useState } from "react";
import {
  Plug,
  CheckCircle2,
  ExternalLink,
  Heart,
  Activity,
  Droplet,
  Watch,
  Scale,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SENSORS, type SensorCategory } from "@/lib/integrations/sensors";
import {
  connect,
  disconnect,
  loadConnections,
} from "@/lib/integrations/storage";
import { SensorDataPanel } from "./SensorDataPanel";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<SensorCategory, React.ReactNode> = {
  aggregator: <Heart className="h-4 w-4" />,
  cgm: <Droplet className="h-4 w-4" />,
  blood_pressure: <Activity className="h-4 w-4" />,
  wearable: <Watch className="h-4 w-4" />,
  scale: <Scale className="h-4 w-4" />,
  oximeter: <Wind className="h-4 w-4" />,
  spirometer: <Wind className="h-4 w-4" />,
  ecg: <Activity className="h-4 w-4" />,
  thermometer: <Activity className="h-4 w-4" />,
  sleep: <Watch className="h-4 w-4" />,
};

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  partner_only: "Partner approval needed",
  soon: "Coming soon",
};

export function SensorIntegrations() {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setConnectedIds(new Set(loadConnections().map((c) => c.sensorId)));
  }, []);

  const toggle = (sensorId: string) => {
    if (connectedIds.has(sensorId)) {
      const next = disconnect(sensorId);
      setConnectedIds(new Set(next.map((c) => c.sensorId)));
    } else {
      const next = connect(sensorId);
      setConnectedIds(new Set(next.map((c) => c.sensorId)));
    }
  };

  return (
    <section className="glimpse-card p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
            Connect your sensors
          </p>
          <h2 className="text-xl font-semibold text-ink mt-1">
            More signal in, more conditions covered
          </h2>
        </div>
        <Plug className="h-5 w-5 text-brand-500" />
      </div>

      <p className="text-base text-ink-muted leading-relaxed mb-5">
        The camera and microphone are the foundation. Each sensor you
        connect unlocks more conditions and tightens the signal we already
        capture. Connecting is local in v1 — real OAuth handshakes flip on
        per vendor as their approvals come through.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SENSORS.map((s) => {
          const connected = connectedIds.has(s.id);
          const canConnect = s.status !== "soon" || true; // v1 stubs allow all
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-2xl border p-4 transition",
                connected
                  ? "border-brand-500/40 bg-brand-50/50 sm:col-span-2"
                  : "border-black/[0.06] bg-surface",
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                    connected
                      ? "bg-brand-500 text-white"
                      : "bg-brand-50 text-brand-500",
                  )}
                >
                  {connected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    CATEGORY_ICON[s.category]
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-ink truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {s.vendor}
                    <span className="mx-1.5 text-ink-subtle">·</span>
                    {STATUS_LABEL[s.status]}
                  </p>
                </div>
              </div>
              <p className="text-sm text-ink-muted leading-snug mb-3 line-clamp-3">
                {s.blurb}
              </p>
              <div className="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant={connected ? "secondary" : "primary"}
                  onClick={() => toggle(s.id)}
                  disabled={!canConnect}
                >
                  {connected ? "Disconnect" : "Connect"}
                </Button>
                <a
                  href={s.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand-500"
                >
                  Docs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {connected ? <SensorDataPanel sensor={s} /> : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-xs text-ink-muted leading-relaxed">
        Honest framing: today's button stores connection intent locally.
        Each real integration ships when its OAuth / partner handshake
        clears — we're set up to flip them on one at a time.
      </p>
    </section>
  );
}

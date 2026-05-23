"use client";

import { useEffect, useMemo, useState } from "react";
import { Plug, Heart, Droplet, Activity, Moon, Wind, Scale } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { SENSORS, type SensorDefinition } from "@/lib/integrations/sensors";
import { loadConnections } from "@/lib/integrations/storage";
import {
  buildActivityDemo,
  buildBpDemo,
  buildCgmDemo,
  buildSleepDemo,
  buildSpo2Demo,
  buildWeightDemo,
  buildUserContext,
  type UserContext,
} from "@/lib/integrations/demo-data";
import { loadOnboarding } from "@/lib/db/mock-db";
import { cn } from "@/lib/utils";

// Aggregated sensor-derived insights for the report. Pulls connected
// sensors + the user's profile, generates the demo data, and surfaces
// 2-3 key metrics per sensor so the report stays a single readable
// narrative rather than a dump.

export function SensorReportSection() {
  const [hydrated, setHydrated] = useState(false);
  const [connected, setConnected] = useState<SensorDefinition[]>([]);
  const [context, setContext] = useState<UserContext | null>(null);

  useEffect(() => {
    const ids = new Set(loadConnections().map((c) => c.sensorId));
    setConnected(SENSORS.filter((s) => ids.has(s.id)));
    setContext(buildUserContext(loadOnboarding()));
    setHydrated(true);
  }, []);

  const cards = useMemo(() => {
    if (!context) return [];
    return connected
      .map((s) => buildCard(s, context))
      .filter((c): c is SensorReportCard => c !== null);
  }, [connected, context]);

  if (!hydrated) return null;
  if (cards.length === 0) {
    return (
      <section className="glimpse-card p-6">
        <div className="flex items-start gap-3">
          <Plug className="h-5 w-5 text-ink-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-brand-500">
              Connect a sensor
            </p>
            <p className="text-base text-ink mt-1">
              Connecting Apple Health, a CGM, or a BP cuff lets us tighten
              this report with objective data. Right now we&apos;re working
              from camera + microphone signals only.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wider text-brand-500 mb-2">
        From your connected sensors
      </p>
      <h2 className="text-2xl font-semibold text-ink mb-4">
        What your sensors added this {/* window inherits from parent */}window
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <SensorCard key={c.sensorId} card={c} />
        ))}
      </div>
    </section>
  );
}

// ─── Card model + builders ────────────────────────────────────────────

interface SensorReportCard {
  sensorId: string;
  title: string;
  icon: React.ReactNode;
  series: number[];
  tone: "improving" | "stable" | "watch";
  stats: Array<{ label: string; value: string }>;
  insight: string;
}

function buildCard(
  sensor: SensorDefinition,
  context: UserContext,
): SensorReportCard | null {
  switch (sensor.category) {
    case "cgm": {
      const data = buildCgmDemo(context);
      const series = data.readings
        .filter((_, i) => i % 6 === 0)
        .map((r) => r.mgdl);
      return {
        sensorId: sensor.id,
        title: sensor.name,
        icon: <Droplet className="h-4 w-4" />,
        series,
        tone:
          data.diabetesStage === "normal"
            ? "improving"
            : data.diabetesStage === "type_1"
              ? "watch"
              : "stable",
        stats: [
          { label: "Mean", value: `${data.meanMgdl} mg/dL` },
          { label: "TIR", value: `${data.timeInRangePct}%` },
          { label: "GMI", value: `${data.gmi}%` },
        ],
        insight:
          data.diabetesStage === "normal"
            ? "Glucose stayed in range nearly all of the captured window — no pattern of concern."
            : data.diabetesStage === "prediabetic"
              ? `Postprandial spikes pushed time-above-range to ${data.timeAbovePct}%. Worth correlating with morning Stroop scores.`
              : data.diabetesStage === "type_1"
                ? `Wide swings (CV ${data.cvPercent}%). Cognitive task performance dipped on days with the largest excursions.`
                : `Mean ${data.meanMgdl} mg/dL with modest variability. Glucose-cognition correlation is becoming visible in your weekly trend.`,
      };
    }
    case "blood_pressure": {
      const data = buildBpDemo(context);
      const series = data.readings.map((r) => r.systolic);
      return {
        sensorId: sensor.id,
        title: sensor.name,
        icon: <Activity className="h-4 w-4" />,
        series,
        tone:
          data.classification === "normal"
            ? "improving"
            : data.classification === "stage_2"
              ? "watch"
              : "stable",
        stats: [
          { label: "Systolic", value: `${data.meanSystolic}` },
          { label: "Diastolic", value: `${data.meanDiastolic}` },
          { label: "Readings", value: `${data.readings.length}` },
        ],
        insight:
          data.classification === "normal"
            ? "Cuff readings agree with the camera-rPPG estimate to within ±3 bpm — your morning estimate is trustworthy."
            : `${data.classification.replace("_", " ")} range over 30 days. We adjust the daily session to keep a closer eye on stroke-pattern signals.`,
      };
    }
    case "wearable":
    case "aggregator": {
      const sleep = buildSleepDemo(context);
      const series = sleep.nights.map((n) => n.hrv);
      return {
        sensorId: sensor.id,
        title: sensor.name,
        icon: <Heart className="h-4 w-4" />,
        series,
        tone: sleep.averageHrv < 35 ? "watch" : "improving",
        stats: [
          { label: "Sleep", value: `${sleep.averageHours} h` },
          { label: "Eff.", value: `${sleep.averageEfficiencyPct}%` },
          { label: "HRV", value: `${sleep.averageHrv} ms` },
        ],
        insight: sleep.fragmentationFlag
          ? "Fragmented sleep is the most likely confounder for your finger-tap dips this week."
          : "Sleep stayed efficient and HRV held steady — strong supporting context for the rest of the signals.",
      };
    }
    case "scale": {
      const w = buildWeightDemo(context, loadOnboarding().account?.weightKg ?? 78);
      const series = w.readings.map((r) => r.kg);
      return {
        sensorId: sensor.id,
        title: sensor.name,
        icon: <Scale className="h-4 w-4" />,
        series,
        tone: w.trend === "rising" ? "watch" : "stable",
        stats: [
          { label: "Avg", value: `${w.averageKg} kg` },
          {
            label: "Range",
            value: `${Math.min(...series)}–${Math.max(...series)} kg`,
          },
        ],
        insight:
          w.trend === "rising"
            ? "Weight has drifted upward across the window. If sustained, worth a conversation at your next physician visit."
            : w.trend === "falling"
              ? "Weight has drifted downward across the window — unintentional loss is also worth mentioning at a visit."
              : "Weight has stayed within normal day-to-day variation.",
      };
    }
    case "oximeter": {
      const data = buildSpo2Demo(context);
      const series = data.samples.map((s) => s.spo2);
      return {
        sensorId: sensor.id,
        title: sensor.name,
        icon: <Wind className="h-4 w-4" />,
        series,
        tone: data.desaturationEvents > 0 ? "watch" : "improving",
        stats: [
          { label: "Avg", value: `${data.averageSpo2}%` },
          { label: "Nadir", value: `${data.nadirSpo2}%` },
          { label: "Events", value: `${data.desaturationEvents}` },
        ],
        insight:
          data.desaturationEvents > 0
            ? "Multiple overnight desaturations below 88%. This matches the sleep-apnea-screening pattern — worth a sleep study referral."
            : "Overnight SpO₂ stayed in healthy range across the window.",
      };
    }
    default:
      return null;
  }
}

function SensorCard({ card }: { card: SensorReportCard }) {
  return (
    <div className="glimpse-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center",
            "bg-brand-50 text-brand-500",
          )}
        >
          {card.icon}
        </span>
        <p className="text-base font-semibold text-ink">{card.title}</p>
      </div>
      <Sparkline points={card.series} tone={card.tone} height={56} showEndDot={false} />
      <dl className="mt-3 grid grid-cols-3 gap-3">
        {card.stats.map((s) => (
          <div key={s.label}>
            <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
              {s.label}
            </dt>
            <dd className="text-sm font-semibold text-ink tabular-nums">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-ink-muted mt-3 leading-relaxed">
        {card.insight}
      </p>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  Droplet,
  Activity,
  Moon,
  Heart,
  Scale,
  Wind,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Sparkline } from "./Sparkline";
import {
  buildActivityDemo,
  buildBpDemo,
  buildCgmDemo,
  buildSleepDemo,
  buildSpo2Demo,
  buildUserContext,
  buildWeightDemo,
  type UserContext,
} from "@/lib/integrations/demo-data";
import { loadOnboarding } from "@/lib/db/mock-db";
import type { SensorDefinition } from "@/lib/integrations/sensors";
import { cn } from "@/lib/utils";

interface SensorDataPanelProps {
  sensor: SensorDefinition;
}

// Renders a sensor-appropriate demo data panel. Loads the user's
// onboarding context once and dispatches to the right view per category.
export function SensorDataPanel({ sensor }: SensorDataPanelProps) {
  const context = useMemo<UserContext>(
    () => buildUserContext(loadOnboarding()),
    [],
  );

  return (
    <div className="mt-4 rounded-2xl border border-brand-500/20 bg-brand-50/30 p-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Live preview · demo data tuned to your profile
        </p>
        <span className="text-xs text-ink-subtle">
          Not real readings — what {sensor.name} would surface
        </span>
      </div>

      {sensor.category === "cgm" ? <CgmView context={context} /> : null}
      {sensor.category === "blood_pressure" ? (
        <BpView context={context} />
      ) : null}
      {sensor.category === "wearable" || sensor.category === "aggregator" ? (
        <WearableView context={context} />
      ) : null}
      {sensor.category === "scale" ? (
        <WeightView context={context} weightKg={loadOnboarding().account?.weightKg ?? 78} />
      ) : null}
      {sensor.category === "oximeter" ? <Spo2View context={context} /> : null}
    </div>
  );
}

// ─── CGM ──────────────────────────────────────────────────────────────

function CgmView({ context }: { context: UserContext }) {
  const data = useMemo(() => buildCgmDemo(context), [context]);
  const series = data.readings
    .filter((_, i) => i % 6 === 0)
    .map((r) => r.mgdl); // downsample for sparkline

  const stageLabel: Record<typeof data.diabetesStage, string> = {
    normal: "Normoglycemic",
    prediabetic: "Pre-diabetic range",
    type_2: "Type 2 pattern",
    type_1: "Type 1 pattern · brittle",
  };
  const stageTone: Record<typeof data.diabetesStage, string> = {
    normal: "bg-success/12 text-success",
    prediabetic: "bg-warn/15 text-warn",
    type_2: "bg-warn/15 text-warn",
    type_1: "bg-alert/15 text-alert",
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-brand-500" />
          <span className="text-base font-semibold text-ink">
            Last 24 hours
          </span>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium",
            stageTone[data.diabetesStage],
          )}
        >
          {stageLabel[data.diabetesStage]}
        </span>
      </div>
      <Sparkline
        points={series}
        tone={
          data.diabetesStage === "normal"
            ? "improving"
            : data.diabetesStage === "type_1"
              ? "watch"
              : "stable"
        }
        height={56}
      />
      <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Mean glucose" value={`${data.meanMgdl} mg/dL`} />
        <Stat label="Time in range" value={`${data.timeInRangePct}%`} />
        <Stat label="GMI" value={`${data.gmi}%`} />
        <Stat label="CV" value={`${data.cvPercent}%`} />
      </dl>
      {data.timeBelowPct > 0 ? (
        <p className="text-xs text-ink-muted mt-3">
          {data.timeBelowPct}% time below range · {data.timeAbovePct}% above
        </p>
      ) : null}
    </div>
  );
}

// ─── Blood pressure ──────────────────────────────────────────────────

function BpView({ context }: { context: UserContext }) {
  const data = useMemo(() => buildBpDemo(context), [context]);
  const sys = data.readings.map((r) => r.systolic);
  const classLabel = {
    normal: "Normal",
    elevated: "Elevated",
    stage_1: "Stage 1",
    stage_2: "Stage 2",
  }[data.classification];
  const classTone = {
    normal: "bg-success/12 text-success",
    elevated: "bg-brand-50 text-brand-600",
    stage_1: "bg-warn/15 text-warn",
    stage_2: "bg-alert/15 text-alert",
  }[data.classification];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-500" />
          <span className="text-base font-semibold text-ink">
            30-day average
          </span>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium",
            classTone,
          )}
        >
          {classLabel}
        </span>
      </div>
      <Sparkline
        points={sys}
        tone={
          data.classification === "normal"
            ? "improving"
            : data.classification === "stage_2"
              ? "watch"
              : "stable"
        }
        height={56}
      />
      <dl className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Mean systolic" value={`${data.meanSystolic} mmHg`} />
        <Stat label="Mean diastolic" value={`${data.meanDiastolic} mmHg`} />
        <Stat label="Readings" value={`${data.readings.length}`} />
      </dl>
    </div>
  );
}

// ─── Wearable / aggregator ───────────────────────────────────────────

function WearableView({ context }: { context: UserContext }) {
  const sleep = useMemo(() => buildSleepDemo(context), [context]);
  const activity = useMemo(() => buildActivityDemo(context), [context]);
  const hrvSeries = sleep.nights.map((n) => n.hrv);
  const stepsSeries = activity.days.map((d) => d.steps);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Moon className="h-5 w-5 text-brand-500" />
          <span className="text-base font-semibold text-ink">Sleep & HRV</span>
        </div>
        <Sparkline
          points={hrvSeries}
          tone={sleep.averageHrv < 35 ? "watch" : "improving"}
          height={48}
        />
        <dl className="mt-2 grid grid-cols-3 gap-2">
          <Stat label="Sleep" value={`${sleep.averageHours} h`} />
          <Stat label="Efficiency" value={`${sleep.averageEfficiencyPct}%`} />
          <Stat label="HRV" value={`${sleep.averageHrv} ms`} />
        </dl>
        {sleep.fragmentationFlag ? (
          <p className="text-xs text-warn mt-2 inline-flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Fragmentation flag
          </p>
        ) : null}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-brand-500" />
          <span className="text-base font-semibold text-ink">Activity</span>
        </div>
        <Sparkline
          points={stepsSeries}
          tone="stable"
          height={48}
        />
        <dl className="mt-2 grid grid-cols-3 gap-2">
          <Stat label="Steps" value={activity.averageSteps.toLocaleString()} />
          <Stat label="Active" value={`${activity.averageActiveMinutes} min`} />
          <Stat label="Resting HR" value={`${activity.averageRestingHr} bpm`} />
        </dl>
      </div>
    </div>
  );
}

// ─── Weight ──────────────────────────────────────────────────────────

function WeightView({
  context,
  weightKg,
}: {
  context: UserContext;
  weightKg: number;
}) {
  const data = useMemo(() => buildWeightDemo(context, weightKg), [
    context,
    weightKg,
  ]);
  const series = data.readings.map((r) => r.kg);
  const trendLabel = {
    stable: "Stable",
    rising: "Trending up",
    falling: "Trending down",
  }[data.trend];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-brand-500" />
          <span className="text-base font-semibold text-ink">
            30 daily weigh-ins
          </span>
        </div>
        <span className="text-xs text-ink-muted">{trendLabel}</span>
      </div>
      <Sparkline points={series} tone="stable" height={48} />
      <dl className="mt-2 grid grid-cols-2 gap-3">
        <Stat label="Average" value={`${data.averageKg} kg`} />
        <Stat
          label="Range"
          value={`${Math.min(...series)} – ${Math.max(...series)} kg`}
        />
      </dl>
    </div>
  );
}

// ─── SpO2 ────────────────────────────────────────────────────────────

function Spo2View({ context }: { context: UserContext }) {
  const data = useMemo(() => buildSpo2Demo(context), [context]);
  const series = data.samples.map((s) => s.spo2);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-brand-500" />
          <span className="text-base font-semibold text-ink">
            Overnight SpO₂
          </span>
        </div>
        {data.desaturationEvents > 0 ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warn/15 text-warn">
            {data.desaturationEvents} desaturations
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/12 text-success">
            Stable
          </span>
        )}
      </div>
      <Sparkline
        points={series}
        tone={data.desaturationEvents > 0 ? "watch" : "improving"}
        height={48}
      />
      <dl className="mt-2 grid grid-cols-2 gap-3">
        <Stat label="Average" value={`${data.averageSpo2}%`} />
        <Stat label="Nadir" value={`${data.nadirSpo2}%`} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="text-sm font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  );
}

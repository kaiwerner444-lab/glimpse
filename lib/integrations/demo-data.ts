// Demo data for each sensor integration. Adjusts to the user's actual
// clinical context (existing diagnoses, family history, risk profile) so
// the experience of "connecting" a sensor previews what they'd actually
// see — a user with type 1 diabetes sees a CGM trace with frequent
// excursions; a user with a family history of hypertension sees BP
// nudged upward; a user with sleep-apnea risk sees overnight SpO2 dips.
//
// Everything in this file is simulated. The UI labels it as such.

import type { TrackedCondition } from "@/lib/types";
import type { OnboardingState } from "@/lib/types";

export interface UserContext {
  age: number;
  sex: string;
  existingDiagnoses: TrackedCondition[];
  familyDiagnoses: TrackedCondition[];
  confirmedRisks: TrackedCondition[];
}

export function buildUserContext(state: OnboardingState): UserContext {
  const dob = state.account?.dateOfBirth;
  const age = dob
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(dob).getTime()) /
            (365.25 * 24 * 3600 * 1000),
        ),
      )
    : 50;
  const sex = state.account?.sex ?? "prefer_not_to_say";
  const existingDiagnoses = state.clinicalContext?.existingDiagnoses ?? [];
  const familyDiagnoses = Array.from(
    new Set(
      (state.familyHistory?.members ?? []).flatMap((m) => m.conditions),
    ),
  );
  const confirmedRisks = state.riskProfile?.confirmed ?? [];
  return {
    age,
    sex,
    existingDiagnoses,
    familyDiagnoses,
    confirmedRisks,
  };
}

// Severity helpers — graded so the data shifts proportionally to how
// strong the user's signal for that condition is.
function severity(context: UserContext, condition: TrackedCondition): number {
  if (context.existingDiagnoses.includes(condition)) return 1.0;
  if (context.confirmedRisks.includes(condition)) return 0.5;
  if (context.familyDiagnoses.includes(condition)) return 0.25;
  return 0;
}

// Stable per-context seeded RNG so reloads don't reshuffle the demo.
function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function contextSeed(context: UserContext): number {
  const s = [
    context.age,
    context.sex.length,
    context.existingDiagnoses.length * 7,
    context.familyDiagnoses.length * 13,
    context.confirmedRisks.length * 19,
  ];
  return s.reduce((a, b) => (a * 31 + b) | 0, 1);
}

// ─── CGM data (Dexcom / Libre) ──────────────────────────────────────

export interface CgmReading {
  minuteOfDay: number;
  mgdl: number;
}

export interface CgmDemoData {
  readings: CgmReading[];
  timeInRangePct: number;
  timeBelowPct: number;
  timeAbovePct: number;
  meanMgdl: number;
  gmi: number;
  cvPercent: number;
  diabetesStage: "normal" | "prediabetic" | "type_2" | "type_1";
}

export function buildCgmDemo(context: UserContext): CgmDemoData {
  const t1 = severity(context, "type_1_diabetes");
  const t2 = severity(context, "type_2_diabetes");
  const stage: CgmDemoData["diabetesStage"] =
    t1 === 1.0
      ? "type_1"
      : t2 === 1.0
        ? "type_2"
        : t1 + t2 > 0
          ? "prediabetic"
          : "normal";

  // Baseline glucose + meal-response amplitude tuned by stage.
  const baseline =
    stage === "type_1"
      ? 165
      : stage === "type_2"
        ? 150
        : stage === "prediabetic"
          ? 110
          : 92;
  const mealAmplitude =
    stage === "type_1" ? 75 : stage === "type_2" ? 55 : stage === "prediabetic" ? 35 : 22;
  const noiseAmplitude =
    stage === "type_1" ? 18 : stage === "type_2" ? 10 : stage === "prediabetic" ? 6 : 4;

  const rng = seededRng(contextSeed(context) ^ 0xc6a4a793);
  const readings: CgmReading[] = [];

  // 5-min readings over 24h = 288 samples.
  const MEALS_AT = [8 * 60, 13 * 60, 19 * 60]; // breakfast, lunch, dinner

  for (let m = 0; m < 24 * 60; m += 5) {
    let mealEffect = 0;
    for (const mealMin of MEALS_AT) {
      const dt = m - mealMin;
      if (dt > 0 && dt < 180) {
        // Spike that rises over 30 min, decays over 150.
        const x = dt < 30 ? dt / 30 : 1 - (dt - 30) / 150;
        mealEffect += mealAmplitude * Math.max(0, x);
      }
    }
    const dawn =
      m > 4 * 60 && m < 8 * 60 ? 8 * Math.sin(((m - 4 * 60) / 240) * Math.PI) : 0;
    const value =
      baseline + mealEffect + dawn + (rng() - 0.5) * 2 * noiseAmplitude;
    readings.push({ minuteOfDay: m, mgdl: Math.round(value) });
  }

  const inRange = readings.filter((r) => r.mgdl >= 70 && r.mgdl <= 180).length;
  const below = readings.filter((r) => r.mgdl < 70).length;
  const above = readings.filter((r) => r.mgdl > 180).length;
  const mean = readings.reduce((a, b) => a + b.mgdl, 0) / readings.length;
  const sd = Math.sqrt(
    readings.reduce((a, b) => a + (b.mgdl - mean) ** 2, 0) / readings.length,
  );
  // ADAG-derived GMI estimate.
  const gmi = 3.31 + 0.02392 * mean;

  return {
    readings,
    timeInRangePct: Math.round((inRange / readings.length) * 100),
    timeBelowPct: Math.round((below / readings.length) * 100),
    timeAbovePct: Math.round((above / readings.length) * 100),
    meanMgdl: Math.round(mean),
    gmi: Math.round(gmi * 10) / 10,
    cvPercent: Math.round((sd / mean) * 100),
    diabetesStage: stage,
  };
}

// ─── Blood pressure (Withings BPM) ───────────────────────────────────

export interface BpReading {
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
}

export interface BpDemoData {
  readings: BpReading[];
  meanSystolic: number;
  meanDiastolic: number;
  classification: "normal" | "elevated" | "stage_1" | "stage_2";
}

export function buildBpDemo(context: UserContext): BpDemoData {
  const htn = severity(context, "hypertension");
  const cv = severity(context, "cardiovascular");
  const baseSys =
    110 +
    Math.max(0, context.age - 40) * 0.3 +
    htn * 25 +
    cv * 8;
  const baseDia = 70 + htn * 12 + cv * 4;
  const rng = seededRng(contextSeed(context) ^ 0x9e3779b9);

  const readings: BpReading[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const sys = Math.round(baseSys + (rng() - 0.5) * 14);
    const dia = Math.round(baseDia + (rng() - 0.5) * 8);
    readings.push({
      date: d.toISOString().slice(0, 10),
      systolic: sys,
      diastolic: dia,
      pulse: Math.round(68 + (rng() - 0.5) * 12),
    });
  }
  const meanSys =
    readings.reduce((a, b) => a + b.systolic, 0) / readings.length;
  const meanDia =
    readings.reduce((a, b) => a + b.diastolic, 0) / readings.length;
  let classification: BpDemoData["classification"];
  if (meanSys >= 140 || meanDia >= 90) classification = "stage_2";
  else if (meanSys >= 130 || meanDia >= 80) classification = "stage_1";
  else if (meanSys >= 120) classification = "elevated";
  else classification = "normal";

  return {
    readings,
    meanSystolic: Math.round(meanSys),
    meanDiastolic: Math.round(meanDia),
    classification,
  };
}

// ─── Sleep + HRV (Oura / Whoop / Apple Health) ───────────────────────

export interface SleepNight {
  date: string;
  totalMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  efficiencyPct: number;
  hrv: number;
}

export interface SleepDemoData {
  nights: SleepNight[];
  averageHours: number;
  averageEfficiencyPct: number;
  averageHrv: number;
  fragmentationFlag: boolean;
}

export function buildSleepDemo(context: UserContext): SleepDemoData {
  const depression = severity(context, "depression");
  const sleepApneaRisk =
    severity(context, "cardiovascular") * 0.5 +
    severity(context, "hypertension") * 0.3;
  const baseTotal = 420 - depression * 60; // minutes
  const baseEff = 88 - depression * 8 - sleepApneaRisk * 6;
  const baseHrv = 55 - context.age * 0.3 - depression * 6;

  const rng = seededRng(contextSeed(context) ^ 0xdeadbeef);
  const nights: SleepNight[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const total = Math.round(baseTotal + (rng() - 0.5) * 60);
    const efficiency = Math.round(baseEff + (rng() - 0.5) * 6);
    nights.push({
      date: d.toISOString().slice(0, 10),
      totalMinutes: total,
      deepMinutes: Math.round(total * (0.16 + rng() * 0.04)),
      remMinutes: Math.round(total * (0.22 + rng() * 0.04)),
      efficiencyPct: efficiency,
      hrv: Math.round(baseHrv + (rng() - 0.5) * 10),
    });
  }
  const avgHours =
    nights.reduce((a, b) => a + b.totalMinutes, 0) / nights.length / 60;
  const avgEff =
    nights.reduce((a, b) => a + b.efficiencyPct, 0) / nights.length;
  const avgHrv = nights.reduce((a, b) => a + b.hrv, 0) / nights.length;
  return {
    nights,
    averageHours: Math.round(avgHours * 10) / 10,
    averageEfficiencyPct: Math.round(avgEff),
    averageHrv: Math.round(avgHrv),
    fragmentationFlag: avgEff < 80,
  };
}

// ─── Activity (Fitbit / Garmin / Apple Health) ───────────────────────

export interface ActivityDay {
  date: string;
  steps: number;
  activeMinutes: number;
  restingHr: number;
}

export interface ActivityDemoData {
  days: ActivityDay[];
  averageSteps: number;
  averageRestingHr: number;
  averageActiveMinutes: number;
}

export function buildActivityDemo(context: UserContext): ActivityDemoData {
  const cv = severity(context, "cardiovascular");
  const baseSteps = Math.max(2500, 7500 - context.age * 30 - cv * 1500);
  const baseHr = 65 + cv * 6 + context.age * 0.1;
  const baseActive = Math.max(8, 28 - context.age * 0.3 - cv * 6);
  const rng = seededRng(contextSeed(context) ^ 0xbadc0ffe);
  const days: ActivityDay[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      steps: Math.round(baseSteps + (rng() - 0.5) * 2400),
      activeMinutes: Math.round(baseActive + (rng() - 0.5) * 12),
      restingHr: Math.round(baseHr + (rng() - 0.5) * 6),
    });
  }
  return {
    days,
    averageSteps: Math.round(
      days.reduce((a, b) => a + b.steps, 0) / days.length,
    ),
    averageRestingHr: Math.round(
      days.reduce((a, b) => a + b.restingHr, 0) / days.length,
    ),
    averageActiveMinutes: Math.round(
      days.reduce((a, b) => a + b.activeMinutes, 0) / days.length,
    ),
  };
}

// ─── Weight (Withings scale) ─────────────────────────────────────────

export interface WeightReading {
  date: string;
  kg: number;
}

export interface WeightDemoData {
  readings: WeightReading[];
  averageKg: number;
  trend: "stable" | "rising" | "falling";
}

export function buildWeightDemo(
  context: UserContext,
  baseKg = 78,
): WeightDemoData {
  const depression = severity(context, "depression");
  const cv = severity(context, "cardiovascular");
  const slope = depression * 0.05 - cv * 0.02; // depression → mild gain
  const rng = seededRng(contextSeed(context) ^ 0xcafebabe);
  const readings: WeightReading[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    readings.push({
      date: d.toISOString().slice(0, 10),
      kg: Math.round((baseKg + slope * (29 - i) + (rng() - 0.5) * 0.6) * 10) / 10,
    });
  }
  const first = readings[0].kg;
  const last = readings[readings.length - 1].kg;
  const delta = last - first;
  const trend =
    Math.abs(delta) < 0.8 ? "stable" : delta > 0 ? "rising" : "falling";
  return {
    readings,
    averageKg:
      Math.round((readings.reduce((a, b) => a + b.kg, 0) / readings.length) * 10) /
      10,
    trend,
  };
}

// ─── Overnight SpO2 (BLE oximeter) ───────────────────────────────────

export interface SpO2Sample {
  hour: number;
  spo2: number;
}

export interface SpO2DemoData {
  samples: SpO2Sample[];
  averageSpo2: number;
  nadirSpo2: number;
  desaturationEvents: number; // count of dips below 88%
}

export function buildSpo2Demo(context: UserContext): SpO2DemoData {
  const cv = severity(context, "cardiovascular");
  const htn = severity(context, "hypertension");
  // Hypertension is correlated with sleep apnea — push SpO2 down more.
  const apneaPressure = cv * 0.4 + htn * 0.6;
  const rng = seededRng(contextSeed(context) ^ 0xfeedface);
  const samples: SpO2Sample[] = [];
  // ~10 hours of overnight sampling.
  for (let h = 0; h <= 100; h += 1) {
    let spo2 = 97 - apneaPressure * 4;
    // Periodic dips during REM-like windows.
    if (h % 18 < 4 && apneaPressure > 0.3) {
      spo2 -= 8 * apneaPressure;
    }
    spo2 += (rng() - 0.5) * 1.5;
    samples.push({ hour: h, spo2: Math.round(spo2 * 10) / 10 });
  }
  const avg = samples.reduce((a, b) => a + b.spo2, 0) / samples.length;
  const nadir = Math.min(...samples.map((s) => s.spo2));
  const desat = samples.filter((s) => s.spo2 < 88).length;
  return {
    samples,
    averageSpo2: Math.round(avg * 10) / 10,
    nadirSpo2: Math.round(nadir * 10) / 10,
    desaturationEvents: desat,
  };
}

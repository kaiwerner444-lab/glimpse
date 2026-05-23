// External sensor integration registry.
//
// Each entry describes a real consumer / clinical-grade sensor we can
// (will) integrate. The disease tags map each sensor back to conditions
// where its data adds signal beyond the camera + mic — i.e. the value
// the user gets by connecting it.
//
// Today these are CONNECTION STUBS: clicking "Connect" stores intent in
// localStorage. The actual handshake happens via:
//   - Apple HealthKit: native iOS app + HealthKit framework, surfaced
//     to web via a companion or via server-side pull from a partner
//     bridge (Spike API / Vital / Tryterra)
//   - Google Health Connect: similar — Android-native, server-mediated
//   - Dexcom: official Dexcom Developer API (OAuth, partner approval)
//   - Abbott FreeStyle Libre: LibreView API (partner program)
//   - Withings: Withings Cloud API (consumer OAuth)
//   - Fitbit / Garmin / Oura / Whoop: each vendor's REST API (OAuth)
//   - Direct Bluetooth devices: Web Bluetooth API for BP cuffs, pulse
//     oximeters, smart scales that speak the BLE standard health profile
//
// We're scaffolding the contract so adding the real handshake in v2 is
// a swap of the connectStub() implementation per integration.

import type { TrackedCondition } from "@/lib/types";

export type SensorCategory =
  | "aggregator"
  | "cgm"
  | "blood_pressure"
  | "wearable"
  | "scale"
  | "oximeter"
  | "spirometer"
  | "ecg"
  | "thermometer"
  | "sleep";

export interface SensorDefinition {
  id: string;
  name: string;
  vendor: string;
  category: SensorCategory;
  // The metrics this sensor surfaces.
  signals: string[];
  // Conditions where the data meaningfully adds signal.
  enrichesConditions: TrackedCondition[];
  // Short marketing line for the integration card.
  blurb: string;
  // External docs (so the user can verify it's real).
  docs: string;
  // Where we are with the integration:
  //   "available" — handshake wired and works today
  //   "partner_only" — Meta/Dexcom-style: SDK exists but requires partner approval
  //   "soon" — public docs exist, we just haven't built it yet
  status: "available" | "partner_only" | "soon";
}

export const SENSORS: SensorDefinition[] = [
  // ─── Aggregators ────────────────────────────────────────────────────
  {
    id: "apple_health",
    name: "Apple Health",
    vendor: "Apple",
    category: "aggregator",
    signals: [
      "heart rate",
      "HRV",
      "sleep stages",
      "blood oxygen",
      "ECG",
      "blood pressure",
      "weight",
      "steps",
      "VO2 max",
      "HbA1c (logged)",
    ],
    enrichesConditions: [
      "cardiovascular",
      "hypertension",
      "type_2_diabetes",
      "depression",
      "stroke",
    ],
    blurb:
      "Pulls HR, HRV, sleep, BP, ECG and more from your iPhone and Apple Watch. The biggest single integration.",
    docs: "https://developer.apple.com/documentation/healthkit",
    status: "soon",
  },
  {
    id: "health_connect",
    name: "Google Health Connect",
    vendor: "Google",
    category: "aggregator",
    signals: [
      "heart rate",
      "HRV",
      "sleep",
      "blood oxygen",
      "blood pressure",
      "weight",
      "steps",
    ],
    enrichesConditions: [
      "cardiovascular",
      "hypertension",
      "type_2_diabetes",
      "depression",
    ],
    blurb:
      "Android equivalent of HealthKit. Aggregates data from Fitbit, Withings, Samsung Health and more.",
    docs: "https://developer.android.com/health-and-fitness/guides/health-connect",
    status: "soon",
  },

  // ─── Continuous glucose monitors (diabetes) ─────────────────────────
  {
    id: "dexcom",
    name: "Dexcom G7",
    vendor: "Dexcom",
    category: "cgm",
    signals: [
      "interstitial glucose (every 5 min)",
      "time in range",
      "glucose variability",
    ],
    enrichesConditions: ["type_1_diabetes", "type_2_diabetes"],
    blurb:
      "Real-time CGM. With Dexcom data we can correlate cognitive performance with glucose excursions and surface pre-clinical diabetes patterns.",
    docs: "https://developer.dexcom.com/",
    status: "partner_only",
  },
  {
    id: "libre",
    name: "FreeStyle Libre",
    vendor: "Abbott",
    category: "cgm",
    signals: [
      "interstitial glucose",
      "time in range",
      "glucose management indicator (GMI)",
    ],
    enrichesConditions: ["type_1_diabetes", "type_2_diabetes"],
    blurb:
      "Affordable CGM. The LibreView API gives daily glucose summaries we can map onto cognitive and movement trends.",
    docs: "https://developer.libreview.io/",
    status: "partner_only",
  },

  // ─── Blood pressure ─────────────────────────────────────────────────
  {
    id: "withings_bp",
    name: "Withings BPM",
    vendor: "Withings",
    category: "blood_pressure",
    signals: [
      "systolic / diastolic",
      "pulse",
      "BP variability over time",
    ],
    enrichesConditions: [
      "hypertension",
      "stroke",
      "cardiovascular",
    ],
    blurb:
      "Home BP cuff with sync. Pairs naturally with rPPG: validates the camera estimate against a clinical-grade reading.",
    docs: "https://developer.withings.com/",
    status: "soon",
  },

  // ─── Wearables ──────────────────────────────────────────────────────
  {
    id: "oura",
    name: "Oura Ring",
    vendor: "Oura",
    category: "wearable",
    signals: [
      "sleep stages",
      "HRV",
      "body temperature",
      "resting HR",
      "respiratory rate",
    ],
    enrichesConditions: [
      "depression",
      "cardiovascular",
      "hypertension",
    ],
    blurb:
      "Best-in-class sleep + HRV. Sleep fragmentation is one of the earliest signals of cognitive decline.",
    docs: "https://cloud.ouraring.com/v2/docs",
    status: "soon",
  },
  {
    id: "whoop",
    name: "Whoop",
    vendor: "Whoop",
    category: "wearable",
    signals: ["HRV", "recovery", "sleep", "strain"],
    enrichesConditions: ["depression", "cardiovascular"],
    blurb:
      "24/7 HRV and recovery. HRV trend changes precede many chronic conditions.",
    docs: "https://developer.whoop.com/",
    status: "soon",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    vendor: "Google",
    category: "wearable",
    signals: ["HR", "HRV", "sleep", "steps", "SpO2", "stress"],
    enrichesConditions: [
      "cardiovascular",
      "hypertension",
      "depression",
    ],
    blurb:
      "Wide install base. Continuous HR and sleep data over years gives the longest tail of any wearable.",
    docs: "https://dev.fitbit.com/build/reference/web-api/",
    status: "soon",
  },
  {
    id: "garmin",
    name: "Garmin",
    vendor: "Garmin",
    category: "wearable",
    signals: ["HR", "HRV", "VO2 max", "sleep", "stress"],
    enrichesConditions: ["cardiovascular"],
    blurb:
      "Endurance-grade telemetry. Strong gait + cadence data we could use for early movement-disorder signal.",
    docs: "https://developer.garmin.com/gc-developer-program/health-api/",
    status: "soon",
  },

  // ─── Other ─────────────────────────────────────────────────────────
  {
    id: "withings_scale",
    name: "Withings Body+",
    vendor: "Withings",
    category: "scale",
    signals: [
      "weight",
      "body composition",
      "weight trend (rapid change = clinical flag)",
    ],
    enrichesConditions: [
      "cardiovascular",
      "type_2_diabetes",
      "depression",
    ],
    blurb:
      "Rapid weight change is a flag for heart failure, depression, and thyroid issues. Daily weigh-in gives that signal cheaply.",
    docs: "https://developer.withings.com/",
    status: "soon",
  },
  {
    id: "ble_oximeter",
    name: "Bluetooth pulse oximeter",
    vendor: "Generic (Web Bluetooth)",
    category: "oximeter",
    signals: ["SpO2", "pulse rate"],
    enrichesConditions: ["cardiovascular", "stroke"],
    blurb:
      "Any BLE-standard pulse oximeter. Useful for sleep apnea screening and overnight SpO2 dips.",
    docs: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API",
    status: "soon",
  },
];

export function sensorsForCondition(
  condition: TrackedCondition,
): SensorDefinition[] {
  return SENSORS.filter((s) => s.enrichesConditions.includes(condition));
}

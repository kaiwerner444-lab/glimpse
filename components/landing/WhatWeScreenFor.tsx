import {
  Brain,
  HeartPulse,
  Activity,
  Eye,
  MoonStar,
  AlertTriangle,
  Smile,
  Footprints,
} from "lucide-react";

interface Condition {
  label: string;
  channel: string;
  icon: React.ReactNode;
}

const CONDITIONS: Condition[] = [
  {
    label: "Alzheimer's & MCI",
    channel: "Speech complexity, lexical diversity, delayed recall",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    label: "Parkinson's",
    channel: "Voice jitter, facial masking, finger-tap bradykinesia",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: "Stroke risk",
    channel: "Facial symmetry, arm drift, articulation clarity",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    label: "Multiple sclerosis",
    channel: "Speech, eye movement, fine-motor symmetry",
    icon: <Eye className="h-5 w-5" />,
  },
  {
    label: "Cardiovascular & hypertension",
    channel: "Heart rate, HRV via remote photoplethysmography",
    icon: <HeartPulse className="h-5 w-5" />,
  },
  {
    label: "Depression & anxiety",
    channel: "Prosody flattening, reduced facial expressivity",
    icon: <Smile className="h-5 w-5" />,
  },
  {
    label: "Sleep apnea",
    channel: "Morning voice resonance, self-reported sleep",
    icon: <MoonStar className="h-5 w-5" />,
  },
  {
    label: "Frailty & fall risk",
    channel: "Sit-to-stand, single-leg stance, gait analysis",
    icon: <Footprints className="h-5 w-5" />,
  },
];

export function WhatWeScreenFor() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-600 px-3 py-1 text-xs font-medium uppercase tracking-wider">
          What we listen for
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight max-w-2xl">
        Eight signal channels, all from a five-minute mirror.
      </h2>
      <p className="mt-3 text-lg text-ink-muted max-w-2xl leading-relaxed">
        Each condition has a known early-signal channel that&apos;s decades
        old in clinical research. We just bring those measurements out of
        the clinic and into your morning, daily.
      </p>

      <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CONDITIONS.map((c) => (
          <li key={c.label} className="glimpse-card p-5">
            <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
              {c.icon}
            </div>
            <p className="text-base font-semibold text-ink leading-snug">
              {c.label}
            </p>
            <p className="text-sm text-ink-muted mt-1.5 leading-snug">
              {c.channel}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-ink-muted max-w-2xl leading-relaxed">
        Glimpse describes what it observes; it does not diagnose. Disease-specific
        modules unlock based on your personal risk profile so the daily five
        minutes stays focused on what matters for you.
      </p>
    </section>
  );
}

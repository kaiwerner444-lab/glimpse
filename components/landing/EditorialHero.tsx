"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EditorialHeroProps {
  resumeHref: string;
}

// Editorial medical instrument. 7:5 asymmetric split, copy left,
// instrument panel right. Hairline rules instead of borders. Choreographed
// entrance on first paint:
//
//   eyebrow      100ms
//   headline     200ms
//   subhead      400ms
//   buttons      550ms
//   proof strip  700ms
//   instrument   300ms (slides from translateX 24px)
//
// All entrances run on cubic-bezier(0.2, 0.7, 0.2, 1). prefers-reduced-
// motion collapses everything to 0.01ms via the global rule in
// globals.css.

const ENTRY_EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

export function EditorialHero({ resumeHref }: EditorialHeroProps) {
  return (
    <section className="relative pb-20 sm:pb-28 lg:pb-32">
      {/* Hairline rule under the sticky header echoing the editorial grid */}
      <div className="absolute inset-x-0 top-0 glimpse-hairline" aria-hidden />

      <div className="pt-16 sm:pt-20 lg:pt-24 grid grid-cols-12 gap-x-6 sm:gap-x-10 lg:gap-x-14">
        {/* ─── LEFT 7/12: copy column ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <p
            className="glimpse-mono opacity-0"
            style={{
              animation: `hero-rise 700ms ${ENTRY_EASE} 100ms forwards`,
            }}
          >
            <span className="text-brand-700">PROACTIVE SCREENING</span>
            <span className="mx-2 text-ink-subtle">·</span>
            ON YOUR TERMS
          </p>

          <h1
            className="glimpse-display glimpse-h1 mt-7 max-w-[14ch] opacity-0"
            style={{
              animation: `hero-rise 700ms ${ENTRY_EASE} 200ms forwards`,
            }}
          >
            The earliest signals. <em className="text-brand-500">Years</em>{" "}
            before a clinic would.
          </h1>

          <p
            className="mt-7 max-w-[44ch] text-[18px] leading-[1.55] text-ink-muted opacity-0"
            style={{
              animation: `hero-rise 700ms ${ENTRY_EASE} 400ms forwards`,
            }}
          >
            Five minutes a day, in front of any mirror. Meta Ray Ban glasses,
            your phone camera, and your genome read the small drifts in
            speech, movement and expression that precede neurological and
            chronic disease.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-3 opacity-0"
            style={{
              animation: `hero-rise 700ms ${ENTRY_EASE} 550ms forwards`,
            }}
          >
            <Link
              href={resumeHref}
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-surface px-5 h-12 text-[15px] font-medium transition-all duration-200 hover:-translate-y-px"
              style={{ transitionTimingFunction: ENTRY_EASE }}
            >
              Get started
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[3px]"
                style={{ transitionTimingFunction: ENTRY_EASE }}
              />
            </Link>
            <Link
              href="/clinician"
              className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-5 h-12 text-[15px] font-medium text-ink hover:bg-surface-paper transition-colors duration-200"
            >
              I am a clinician
            </Link>
          </div>

          {/* Proof strip — hairline rule above, three serif numbers with
              monospace labels below. */}
          <div
            className="mt-12 sm:mt-16 opacity-0"
            style={{
              animation: `hero-rise 700ms ${ENTRY_EASE} 700ms forwards`,
            }}
          >
            <div className="glimpse-hairline mb-7" aria-hidden />
            <dl className="grid grid-cols-3 gap-6">
              <ProofStat number="5" label="MINUTES DAILY" />
              <ProofStat number="8" label="SIGNAL CHANNELS" />
              <ProofStat number="21" label="BIOMARKERS TRACKED" />
            </dl>
          </div>
        </div>

        {/* ─── RIGHT 5/12: instrument panel ──────────────────────── */}
        <aside
          className="col-span-12 lg:col-span-5 mt-12 lg:mt-2 opacity-0"
          style={{
            animation: `hero-instrument 800ms ${ENTRY_EASE} 300ms forwards`,
          }}
        >
          <InstrumentPanel />
        </aside>
      </div>
    </section>
  );
}

function ProofStat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="glimpse-display text-[clamp(40px,5vw,52px)] leading-none text-ink tabular-nums">
        {number}
      </div>
      <div className="glimpse-mono mt-3 text-ink-muted">{label}</div>
    </div>
  );
}

// ─── Instrument panel ───────────────────────────────────────────────
//
// Single moment of real diagnostic data: a continuous speech waveform
// readout with bilateral facial-symmetry landmarks below, framed by
// hairline rules and labelled in monospace like a medical device.

function InstrumentPanel() {
  return (
    <figure className="relative">
      <div className="bg-surface-paper border border-hairline">
        {/* Top instrument header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-capture-pulse"
            />
            <span className="glimpse-mono text-ink">SIGNAL CAPTURE</span>
          </div>
          <span className="glimpse-mono text-ink-subtle">
            CH 01 · SPEECH
          </span>
        </div>

        {/* Waveform readout */}
        <div className="px-5 pt-6 pb-4 relative">
          <Waveform />
          <div className="mt-3 flex items-center justify-between">
            <span className="glimpse-mono text-ink-subtle">
              F0 · 168 HZ
            </span>
            <span className="glimpse-mono text-ink-subtle">
              JITTER · 0.42 PCT
            </span>
            <span className="glimpse-mono text-ink-subtle">
              HNR · 22.6 DB
            </span>
          </div>
        </div>

        {/* Sub-divider */}
        <div className="glimpse-hairline" aria-hidden />

        {/* Bilateral facial-symmetry landmarks */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <span className="glimpse-mono text-ink">
            FACIAL SYMMETRY · BILATERAL
          </span>
          <span className="glimpse-mono text-ink-subtle">CH 02 · VISUAL</span>
        </div>
        <div className="px-5 pb-6">
          <FacialSymmetryPlot />
          <div className="mt-3 flex items-center justify-between">
            <span className="glimpse-mono text-ink-subtle">
              MEAN · 97.4 PCT
            </span>
            <span className="glimpse-mono text-ink-subtle">
              SD · 1.1 PCT
            </span>
            <span className="glimpse-mono text-ink-subtle">
              FRAMES · 1804
            </span>
          </div>
        </div>
      </div>
      <figcaption className="glimpse-mono mt-3 text-ink-subtle">
        LIVE CAPTURE · ON-DEVICE · NO RAW STREAM LEAVES THE BROWSER
      </figcaption>
    </figure>
  );
}

// Continuous speech waveform. Built from a deterministic SVG path —
// approximates a real speech-energy envelope (vowel peaks with consonant
// dips) and breathes via a slow scaleY on the wrapper so it reads as
// alive without burning a real audio analyser cycle on the landing page.
function Waveform() {
  // Pre-computed amplitude envelope across 64 bars. Mid-range bias with
  // periodic peaks where the "vowels" sit.
  const bars = WAVEFORM_AMPLITUDES;
  return (
    <div
      className="relative h-24 sm:h-28 origin-bottom animate-breathe"
      role="img"
      aria-label="Speech waveform readout — live signal capture"
    >
      <svg
        viewBox="0 0 320 80"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Centre baseline */}
        <line
          x1="0"
          y1="40"
          x2="320"
          y2="40"
          stroke="rgba(14, 20, 19, 0.08)"
          strokeWidth="1"
        />
        {bars.map((a, i) => {
          const x = (i / (bars.length - 1)) * 320;
          const h = a * 32;
          return (
            <line
              key={i}
              x1={x}
              y1={40 - h}
              x2={x}
              y2={40 + h}
              stroke="#00707E"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={0.55 + a * 0.45}
            />
          );
        })}
        {/* Active capture cursor */}
        <line
          x1="252"
          y1="6"
          x2="252"
          y2="74"
          stroke="#004E58"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

// Bilateral facial-symmetry plot — six landmark pairs on a face midline.
// The pairs reflect across the central vertical axis with hairline
// connectors that show the comparison the system makes every frame.
function FacialSymmetryPlot() {
  // x,y on a 320×120 canvas. Each pair is mirrored across x=160.
  const pairs: Array<[number, number]> = [
    [42, 32], // brow outer
    [86, 30], // brow inner
    [62, 56], // eye corner
    [102, 56], // eye inner
    [80, 86], // cheek
    [62, 108], // jaw
  ];
  return (
    <div className="h-28 sm:h-32 relative">
      <svg
        viewBox="0 0 320 120"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Midline */}
        <line
          x1="160"
          y1="4"
          x2="160"
          y2="116"
          stroke="rgba(14, 20, 19, 0.18)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        {/* Soft face outline — two arcs joined at the bottom */}
        <path
          d="M 36 60 C 36 18, 124 4, 160 6 C 196 4, 284 18, 284 60 C 284 100, 220 116, 160 116 C 100 116, 36 100, 36 60 Z"
          fill="none"
          stroke="rgba(14, 20, 19, 0.18)"
          strokeWidth="1"
        />
        {pairs.flatMap(([lx, ly], i) => {
          const rx = 320 - lx;
          return [
            // Hairline connector across the midline.
            <line
              key={`c-${i}`}
              x1={lx}
              y1={ly}
              x2={rx}
              y2={ly}
              stroke="rgba(14, 20, 19, 0.18)"
              strokeWidth="1"
            />,
            // Left landmark dot
            <circle
              key={`l-${i}`}
              cx={lx}
              cy={ly}
              r="2.5"
              fill="#00707E"
            />,
            // Right landmark dot
            <circle
              key={`r-${i}`}
              cx={rx}
              cy={ly}
              r="2.5"
              fill="#00707E"
            />,
          ];
        })}
      </svg>
    </div>
  );
}

// 64 amplitude values 0..1, hand-shaped to look like a real speech
// envelope. Static array so the bars don't reshuffle on every render
// (the breathing animation comes from a scaleY on the wrapper).
const WAVEFORM_AMPLITUDES = [
  0.18, 0.22, 0.34, 0.48, 0.62, 0.72, 0.78, 0.72, 0.6, 0.48, 0.36, 0.28,
  0.32, 0.42, 0.58, 0.74, 0.86, 0.92, 0.88, 0.78, 0.66, 0.5, 0.38, 0.3,
  0.34, 0.42, 0.5, 0.58, 0.62, 0.6, 0.54, 0.46, 0.4, 0.46, 0.56, 0.68,
  0.78, 0.84, 0.82, 0.74, 0.62, 0.5, 0.4, 0.36, 0.4, 0.5, 0.62, 0.74,
  0.82, 0.84, 0.8, 0.7, 0.58, 0.46, 0.36, 0.3, 0.28, 0.32, 0.42, 0.52,
  0.6, 0.56, 0.46, 0.36,
];

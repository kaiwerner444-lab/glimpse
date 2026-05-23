import { Eye, Mic, Glasses, ArrowRight } from "lucide-react";

// Meta Ray Ban integration vision. Framed honestly as the upgrade that
// arrives when Meta opens developer access — not "coming next month".
// Today's app already does the work via the phone/laptop camera; the
// glasses unlock the hands-free, eye-level, audio-led version of the
// same ritual.

export function MetaVision() {
  return (
    <section className="relative">
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-600 px-3 py-1 text-xs font-medium uppercase tracking-wider">
            <Glasses className="h-3.5 w-3.5" />
            What unlocks with Meta Ray Ban
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight max-w-2xl">
          The mirror ritual, hands-free and at eye level.
        </h2>
        <p className="mt-3 text-lg text-ink-muted max-w-2xl leading-relaxed">
          Glimpse runs on your phone or laptop camera today. The same five
          minutes through Meta Ray Ban gives us cleaner signal and lets you
          forget there&apos;s a screen in the room. We&apos;ll flip this on
          the moment Meta opens developer access to live camera and audio.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <VisionCard
          title="From your point of view"
          body="The glasses watch your hands while you tap, your reflection while you smile — at eye level, no awkward phone-on-the-mirror setup. Same MediaPipe pipeline; vastly cleaner input."
          icon={<Eye className="h-5 w-5" />}
        >
          <EgocentricSvg />
        </VisionCard>
        <VisionCard
          title="Voice-led, no phone needed"
          body="Instructions through the open-ear speakers. You look at yourself in the mirror, not down at the phone — the way actual neurological exams happen in a clinic."
          icon={<Mic className="h-5 w-5" />}
        >
          <AudioSvg />
        </VisionCard>
        <VisionCard
          title="Mirror, made smarter"
          body="An ambient cue floats in your peripheral vision when a balance task starts. Subtle. Never in the way."
          icon={<Glasses className="h-5 w-5" />}
        >
          <MirrorSvg />
        </VisionCard>
      </div>

      <div className="mt-10 glimpse-card p-6 sm:p-7 bg-gradient-to-br from-brand-50 via-surface to-sunrise-50 border-brand-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="sm:col-span-2">
            <p className="text-sm font-medium uppercase tracking-wider text-brand-600 mb-1.5">
              Why this matters clinically
            </p>
            <h3 className="text-xl font-semibold text-ink leading-tight">
              Eye-level capture removes most of the noise.
            </h3>
            <p className="mt-2 text-base text-ink-muted leading-relaxed">
              A phone propped on a counter sees you from a non-clinical angle.
              Glasses see what a clinician sees: head-on, hands in frame,
              symmetric lighting. Cleaner input means smaller drift signals
              get detected sooner.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
              Phone-camera baseline lives today
              <ArrowRight className="h-3.5 w-3.5" />
              Glasses upgrade when Meta opens access
            </div>
          </div>
          <BeforeAfterSvg />
        </div>
      </div>

      <p className="mt-5 text-xs text-ink-muted max-w-2xl leading-relaxed">
        <span className="font-medium text-ink">Honest note:</span> Meta has not
        yet released a public SDK that lets third-party apps stream live data
        from consumer Ray Ban Meta glasses. Our pipeline is architected to
        accept that stream the day it lands; until then your sessions run on
        the phone or laptop camera you already have.
      </p>
    </section>
  );
}

function VisionCard({
  title,
  body,
  icon,
  children,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="glimpse-card p-5 flex flex-col gap-4">
      <div className="relative aspect-[5/3] rounded-xl bg-gradient-to-br from-brand-50/70 via-surface to-sunrise-50/40 overflow-hidden border border-black/[0.04]">
        {children}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
            {icon}
          </span>
          <p className="text-base font-semibold text-ink">{title}</p>
        </div>
        <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
      </div>
    </article>
  );
}

// ─── SVG illustrations ────────────────────────────────────────────────

function EgocentricSvg() {
  return (
    <svg viewBox="0 0 300 180" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="ego-cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00707E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00707E" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Glasses outline at left */}
      <g transform="translate(36 72)">
        <rect x="0" y="0" width="42" height="22" rx="11" fill="#FFFFFF" stroke="#00707E" strokeWidth="2" />
        <rect x="48" y="0" width="42" height="22" rx="11" fill="#FFFFFF" stroke="#00707E" strokeWidth="2" />
        <line x1="42" y1="11" x2="48" y2="11" stroke="#00707E" strokeWidth="2" />
      </g>
      {/* Field-of-view cone */}
      <polygon points="125,90 290,30 290,150" fill="url(#ego-cone)" />
      {/* Hands inside view */}
      <g transform="translate(180 60)" stroke="#00444D" strokeWidth="2" fill="#FFFFFF">
        {/* Left hand */}
        <path d="M 0 30 Q -8 18, 4 10 L 18 6 L 22 18 L 30 14 L 32 30 L 38 26 L 38 44 L 4 44 Z" strokeLinejoin="round" />
        {/* Right hand mirror */}
        <path
          d="M 80 30 Q 88 18, 76 10 L 62 6 L 58 18 L 50 14 L 48 30 L 42 26 L 42 44 L 76 44 Z"
          strokeLinejoin="round"
          transform="translate(-2 0)"
        />
        {/* Pinch detection markers (the thumb-index dots) */}
        <circle cx="22" cy="18" r="3" fill="#00707E" />
        <circle cx="58" cy="18" r="3" fill="#00707E" />
        <circle cx="22" cy="18" r="6" fill="none" stroke="#00707E" strokeOpacity="0.4">
          <animate attributeName="r" from="3" to="9" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="58" cy="18" r="6" fill="none" stroke="#00707E" strokeOpacity="0.4">
          <animate attributeName="r" from="3" to="9" dur="1.6s" begin="0.3s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" begin="0.3s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* Small tap count badge */}
      <g transform="translate(232 124)">
        <rect x="0" y="0" width="48" height="20" rx="10" fill="#00707E" />
        <text x="24" y="14" fontSize="10" fill="#FFFFFF" textAnchor="middle" fontWeight="600">
          47 taps
        </text>
      </g>
    </svg>
  );
}

function AudioSvg() {
  return (
    <svg viewBox="0 0 300 180" className="absolute inset-0 w-full h-full">
      {/* Glasses centered, head shape suggestion */}
      <g transform="translate(96 60)">
        <path d="M 0 30 Q 54 -10, 108 30" stroke="#00707E" strokeWidth="2" fill="none" />
        <rect x="14" y="22" width="34" height="18" rx="9" fill="#FFFFFF" stroke="#00707E" strokeWidth="2" />
        <rect x="60" y="22" width="34" height="18" rx="9" fill="#FFFFFF" stroke="#00707E" strokeWidth="2" />
        <line x1="48" y1="31" x2="60" y2="31" stroke="#00707E" strokeWidth="2" />
      </g>
      {/* Sound waves emanating from temple */}
      <g transform="translate(220 110)" stroke="#D88424" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M 0 0 Q 8 -8, 0 -16">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 8 0 Q 22 -10, 8 -22">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </path>
        <path d="M 16 0 Q 36 -12, 16 -28">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Floating instruction bubble */}
      <g transform="translate(40 122)">
        <rect x="0" y="0" width="156" height="34" rx="17" fill="#FFFFFF" stroke="#00707E" strokeWidth="1.5" />
        <circle cx="14" cy="17" r="4" fill="#00707E" />
        <text x="28" y="21" fontSize="11" fill="#0F1F22" fontWeight="600">
          &quot;Smile and hold&quot;
        </text>
      </g>
    </svg>
  );
}

function MirrorSvg() {
  return (
    <svg viewBox="0 0 300 180" className="absolute inset-0 w-full h-full">
      {/* Mirror frame */}
      <rect
        x="60"
        y="20"
        width="180"
        height="140"
        rx="10"
        fill="#FFFFFF"
        stroke="#00707E"
        strokeWidth="2"
      />
      {/* Person reflection inside mirror */}
      <g transform="translate(112 30)">
        {/* Head */}
        <circle cx="38" cy="38" r="22" fill="#E6F4F5" stroke="#00444D" strokeWidth="2" />
        {/* Glasses on reflection */}
        <rect x="22" y="33" width="12" height="8" rx="4" fill="#FFFFFF" stroke="#00707E" strokeWidth="1.5" />
        <rect x="42" y="33" width="12" height="8" rx="4" fill="#FFFFFF" stroke="#00707E" strokeWidth="1.5" />
        <line x1="34" y1="37" x2="42" y2="37" stroke="#00707E" strokeWidth="1.5" />
        {/* Shoulders */}
        <path d="M 8 90 Q 38 70, 68 90 L 68 110 L 8 110 Z" fill="#E6F4F5" stroke="#00444D" strokeWidth="2" strokeLinejoin="round" />
        {/* Face symmetry markers */}
        <circle cx="28" cy="46" r="2" fill="#2F855A" />
        <circle cx="48" cy="46" r="2" fill="#2F855A" />
        <line x1="38" y1="34" x2="38" y2="56" stroke="#2F855A" strokeWidth="1" strokeDasharray="2 2" />
      </g>
      {/* Floating cue */}
      <g transform="translate(184 134)">
        <rect x="0" y="0" width="44" height="18" rx="9" fill="#2F855A" />
        <text x="22" y="12" fontSize="9" fill="#FFFFFF" textAnchor="middle" fontWeight="600">
          97.5%
        </text>
      </g>
      <text x="170" y="148" fontSize="9" fill="#566366" fontWeight="500">
        symmetry
      </text>
    </svg>
  );
}

function BeforeAfterSvg() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto max-w-[220px] mx-auto">
      <defs>
        <linearGradient id="cone-phone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#566366" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#566366" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cone-glasses" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00707E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00707E" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* LEFT: phone-on-counter, angled view */}
      <g transform="translate(8 8)">
        <text x="0" y="12" fontSize="10" fill="#8A9497" fontWeight="600">
          Phone, on a counter
        </text>
        {/* Person */}
        <circle cx="22" cy="56" r="14" fill="#F6F8F8" stroke="#566366" strokeWidth="1.5" />
        <path d="M 8 92 Q 22 78, 36 92 L 36 122 L 8 122 Z" fill="#F6F8F8" stroke="#566366" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Phone */}
        <rect x="70" y="116" width="16" height="22" rx="2" fill="#FFFFFF" stroke="#566366" strokeWidth="1.5" />
        {/* Capture cone — angled upward from below */}
        <polygon points="78,116 8,40 8,76" fill="url(#cone-phone)" />
      </g>
      {/* RIGHT: glasses, eye-level view */}
      <g transform="translate(108 8)">
        <text x="0" y="12" fontSize="10" fill="#00707E" fontWeight="600">
          Glasses, eye level
        </text>
        {/* Person with glasses */}
        <circle cx="22" cy="56" r="14" fill="#E6F4F5" stroke="#00707E" strokeWidth="1.5" />
        <rect x="12" y="52" width="8" height="5" rx="2.5" fill="#FFFFFF" stroke="#00707E" strokeWidth="1" />
        <rect x="24" y="52" width="8" height="5" rx="2.5" fill="#FFFFFF" stroke="#00707E" strokeWidth="1" />
        <path d="M 8 92 Q 22 78, 36 92 L 36 122 L 8 122 Z" fill="#E6F4F5" stroke="#00707E" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Capture cone — straight from eyes */}
        <polygon points="32,56 84,28 84,84" fill="url(#cone-glasses)" />
        {/* Cleaner-signal indicator */}
        <circle cx="68" cy="48" r="2.5" fill="#2F855A" />
        <circle cx="68" cy="56" r="2.5" fill="#2F855A" />
        <circle cx="68" cy="64" r="2.5" fill="#2F855A" />
      </g>
    </svg>
  );
}

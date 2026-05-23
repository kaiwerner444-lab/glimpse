import { Sunrise, Mic, Cpu, FileText } from "lucide-react";

interface Step {
  num: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Stand in front of a mirror",
    body: "Good morning light, glasses on (or phone propped). The session is voice-led; you don't need to look at the screen.",
    icon: <Sunrise className="h-5 w-5" />,
  },
  {
    num: "02",
    title: "Five short tasks",
    body: "Speech, facial, movement, and a quick cognitive check. Each task has its own countdown — you can't go over.",
    icon: <Mic className="h-5 w-5" />,
  },
  {
    num: "03",
    title: "We analyse in real time",
    body: "MediaPipe and Web Audio extract features from the camera and microphone, on your device. Raw stream is processed and discarded.",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    num: "04",
    title: "Weekly and monthly reports",
    body: "Trends, notable changes, gentle suggestions, and a clinician-ready printable summary you can share securely.",
    icon: <FileText className="h-5 w-5" />,
  },
];

export function HowItWorks() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-600 px-3 py-1 text-xs font-medium uppercase tracking-wider">
          How it works
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight max-w-2xl">
        Five minutes that look like coffee, feel like care.
      </h2>

      <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s) => (
          <li key={s.num} className="glimpse-card p-5 relative">
            <span className="absolute top-4 right-4 text-xs font-semibold tracking-wider text-ink-subtle tabular-nums">
              {s.num}
            </span>
            <div className="h-10 w-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-4">
              {s.icon}
            </div>
            <h3 className="text-base font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

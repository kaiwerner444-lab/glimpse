"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MeshHero } from "@/components/landing/MeshHero";
import { GlimpseEye } from "@/components/dashboard/GlimpseEye";

interface AnimatedHeroProps {
  resumeHref: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Word-by-word mask slide-up. Each word is clipped by its container's
// overflow-hidden and rises from translateY(110%) so the entrance reads
// like text being uncovered rather than fading in.
function SlideWord({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="inline-block overflow-hidden align-bottom leading-[1.05] pb-[0.04em]">
      <motion.span
        className={className}
        style={{ display: "inline-block" }}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Highlight word with an animated draw-in underline that lands after
// the word slides up. Used on "Years" in the headline.
function HighlightWord({
  children,
  delay,
  underlineDelay,
}: {
  children: React.ReactNode;
  delay: number;
  underlineDelay: number;
}) {
  return (
    <span className="inline-block overflow-hidden align-bottom leading-[1.05] pb-[0.04em]">
      <motion.span
        className="relative inline-block text-brand-500"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, ease: EASE, delay }}
      >
        {children}
        <motion.span
          aria-hidden
          className="absolute left-0 right-0 bottom-[0.04em] h-[0.08em] bg-brand-500/35 origin-left rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: underlineDelay }}
        />
      </motion.span>
    </span>
  );
}

export function AnimatedHero({ resumeHref }: AnimatedHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Subtle scroll parallax on the eye — it drifts ~70px upward as the
  // hero scrolls out so the page reads with depth without being a
  // gimmick.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const eyeY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const eyeOpacity = useTransform(scrollYProgress, [0, 0.6], [0.95, 0.3]);

  return (
    <MeshHero>
      <section
        ref={ref}
        className="px-4 sm:px-8 pt-16 sm:pt-28 pb-20 sm:pb-32 relative"
      >
        {/* Eye with scroll-linked parallax */}
        <motion.div
          style={{ y: eyeY, opacity: eyeOpacity }}
          className="absolute right-4 top-12 sm:right-12 sm:top-20 pointer-events-none hidden md:block"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.95 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          >
            <GlimpseEye size={220} />
          </motion.div>
        </motion.div>

        {/* Eyebrow with a hairline rule that draws in from the left */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <motion.span
            aria-hidden
            className="block h-px bg-brand-600/40 origin-left"
            style={{ width: 48 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
            Proactive screening · on your terms
          </p>
        </motion.div>

        {/* Headline — word-by-word slide-up with mask. */}
        <h1 className="glimpse-display text-[2.75rem] sm:text-7xl lg:text-[5.75rem] text-ink max-w-4xl leading-[1.05]">
          <SlideWord delay={0.2}>The</SlideWord>{" "}
          <SlideWord delay={0.26}>earliest</SlideWord>{" "}
          <SlideWord delay={0.32}>signals.</SlideWord>
          <br />
          <HighlightWord delay={0.46} underlineDelay={1.1}>
            Years
          </HighlightWord>{" "}
          <SlideWord delay={0.54}>before</SlideWord>{" "}
          <SlideWord delay={0.6}>a</SlideWord>{" "}
          <SlideWord delay={0.62}>clinic</SlideWord>{" "}
          <SlideWord delay={0.68}>would.</SlideWord>
        </h1>

        {/* Subhead — soft rise. */}
        <motion.p
          className="mt-7 text-lg sm:text-xl text-ink-muted max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.85 }}
        >
          Five minutes a day, in front of any mirror. Meta Ray Ban glasses,
          your phone camera, and your genome — together they pick up the small
          drifts in speech, movement and expression that precede neurological
          and chronic disease.
        </motion.p>

        {/* Buttons with their own stagger + hover treatment. */}
        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 1.0 }}
        >
          <Link href={resumeHref}>
            <Button size="lg" className="gap-2 shadow-elevated group">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/clinician">
            <Button variant="secondary" size="lg">
              I&apos;m a clinician
            </Button>
          </Link>
        </motion.div>

        {/* Trust pills — final beat. */}
        <motion.div
          className="mt-16 flex items-center gap-6 text-sm text-ink-muted flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 1.15 }}
        >
          <Trust>HIPAA-aligned</Trust>
          <Trust>Runs on-device</Trust>
          <Trust>Five minutes a day</Trust>
        </motion.div>
      </section>
    </MeshHero>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}

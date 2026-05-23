"use client";

import { motion, type Variants } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  // Trigger on first appearance only — feels less busy when scrolling
  // back up the page.
  once?: boolean;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Tasteful entrance reveal — fade + 24px upward translate + slight blur
// removal. Uses the modern viewport-margin pattern so it fires shortly
// before the element scrolls into view, not after.
export function Reveal({
  children,
  delay = 0,
  className,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered grid of children — each child fades in with a 60ms offset.
export function StaggerReveal({
  children,
  className,
  stagger = 0.06,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0.05 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

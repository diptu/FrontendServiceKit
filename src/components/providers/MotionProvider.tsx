"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  // reducedMotion="user" makes every motion.* element respect the OS
  // "prefers-reduced-motion: reduce" setting — no per-component handling needed.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

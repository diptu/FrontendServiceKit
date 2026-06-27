"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export interface ScaleInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.45,
  once = true,
  className = "",
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

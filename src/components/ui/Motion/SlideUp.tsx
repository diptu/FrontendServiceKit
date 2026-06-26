"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export interface SlideUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function SlideUp({
  children,
  delay = 0,
  distance = 28,
  duration = 0.55,
  once = true,
  className = "",
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export interface SlideInProps extends HTMLMotionProps<"div"> {
  from?: "left" | "right";
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function SlideIn({
  children,
  from = "left",
  delay = 0,
  distance = 40,
  duration = 0.55,
  once = true,
  className = "",
  ...props
}: SlideInProps) {
  const x = from === "left" ? -distance : distance;

  return (
    <motion.div
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

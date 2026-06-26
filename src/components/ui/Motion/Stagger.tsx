"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/* ── Stagger container ──────────────────────────────────────────────────── */
const containerVariants = (stagger: number, delayChildren: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = (distance: number, duration: number) => ({
  hidden: { opacity: 0, y: distance },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: EASE },
  },
});

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  stagger = 0.08,
  delayChildren = 0.05,
  once = true,
  className = "",
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants(stagger, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger item ────────────────────────────────────────────────────────── */
export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  distance?: number;
  duration?: number;
}

export function StaggerItem({
  children,
  distance = 24,
  duration = 0.5,
  className = "",
  ...props
}: StaggerItemProps) {
  return (
    <motion.div
      variants={itemVariants(distance, duration)}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

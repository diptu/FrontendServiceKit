"use client";

/**
 * Advanced Framer Motion utilities:
 * - ParallaxContainer  — scroll-driven parallax via useScroll/useTransform
 * - AnimatedNumber     — spring count-up for numeric values
 * - SwipeableCard      — drag-to-dismiss card with spring physics
 * - MorphLayout        — layoutId shared element morphing wrapper
 * - RevealOnScroll     — whileInView staggered list reveal
 * - DragCarousel       — horizontal drag carousel with constraints
 */

import {
  type ReactNode,
  useRef,
  useEffect,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  type MotionValue,
} from "framer-motion";

/* ── ParallaxContainer ──────────────────────────────────────────────────── */
export interface ParallaxContainerProps {
  children: ReactNode;
  speed?:   number;
  className?: string;
}

export function ParallaxContainer({ children, speed = 0.15, className = "" }: ParallaxContainerProps) {
  const ref                = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY               = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  const y: MotionValue<string> = useSpring(rawY, { stiffness: 60, damping: 18 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ── AnimatedNumber ─────────────────────────────────────────────────────── */
export interface AnimatedNumberProps {
  value:     number;
  prefix?:   string;
  suffix?:   string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, className = "" }: AnimatedNumberProps) {
  const ref    = useRef<HTMLSpanElement>(null);
  const motVal = useMotionValue(0);
  const spring = useSpring(motVal, { stiffness: 65, damping: 14 });
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (inView) motVal.set(value);
  }, [inView, value, motVal]);

  useEffect(() => {
    return spring.on("change", v => {
      if (ref.current) {
        const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
  }, [spring, prefix, suffix, decimals]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}

/* ── SwipeableCard ──────────────────────────────────────────────────────── */
export interface SwipeableCardProps {
  children:    ReactNode;
  onDismiss?:  () => void;
  threshold?:  number;
  className?:  string;
}

export function SwipeableCard({ children, onDismiss, threshold = 120, className = "" }: SwipeableCardProps) {
  const x        = useMotionValue(0);
  const opacity  = useTransform(x, [-threshold, 0, threshold], [0, 1, 0]);
  const rotate   = useTransform(x, [-200, 200], [-15, 15]);

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (Math.abs(info.offset.x) > threshold) onDismiss?.();
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      style={{ x, opacity, rotate }}
      whileDrag={{ cursor: "grabbing" }}
      className={`cursor-grab ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── MorphLayout ────────────────────────────────────────────────────────── */
export interface MorphLayoutProps {
  layoutId:   string;
  children:   ReactNode;
  className?: string;
}

export function MorphLayout({ layoutId, children, className = "" }: MorphLayoutProps) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── RevealOnScroll ─────────────────────────────────────────────────────── */
export interface RevealOnScrollProps {
  children:        ReactNode;
  staggerDelay?:   number;
  direction?:      "up" | "down" | "left" | "right";
  className?:      string;
}

const DIRECTION_INITIAL = {
  up:    { y: 28, x: 0 },
  down:  { y: -28, x: 0 },
  left:  { x: 28, y: 0 },
  right: { x: -28, y: 0 },
};

const containerVariants = (stagger: number) => ({
  hidden: {},
  show:   { transition: { staggerChildren: stagger } },
});

const itemVariants = (direction: RevealOnScrollProps["direction"]) => ({
  hidden: { opacity: 0, ...DIRECTION_INITIAL[direction ?? "up"] },
  show:   { opacity: 1, x: 0, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
});

export function RevealOnScroll({
  children, staggerDelay = 0.08, direction = "up", className = "",
}: RevealOnScrollProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants(direction)}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants(direction)}>{children}</motion.div>
      }
    </motion.div>
  );
}

/* ── DragCarousel ───────────────────────────────────────────────────────── */
export interface DragCarouselProps {
  children:   ReactNode;
  className?: string;
  gap?:       number;
}

export function DragCarousel({ children, className = "", gap = 16 }: DragCarouselProps) {
  const ref             = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const update = () => {
      const el = ref.current;
      if (el) setWidth(el.scrollWidth - el.offsetWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div ref={ref} className={`overflow-hidden cursor-grab ${className}`} whileTap={{ cursor: "grabbing" }}>
      <motion.div
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        dragElastic={0.05}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        className="flex"
        style={{ gap }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ── PresenceList ────────────────────────────────────────────────────────── */
export interface PresenceListProps<T extends { id: string | number }> {
  items:        T[];
  renderItem:   (item: T) => ReactNode;
  className?:   string;
  itemClassName?: string;
}

export function PresenceList<T extends { id: string | number }>({
  items, renderItem, className = "", itemClassName = "",
}: PresenceListProps<T>) {
  return (
    <motion.ul layout className={className}>
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <motion.li
            key={item.id}
            // layout (FLIP): snapshots before/after positions and drives the
            // delta with transforms — no per-frame height reflow.
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={itemClassName}
          >
            {renderItem(item)}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

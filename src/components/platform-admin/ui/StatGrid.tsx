import type { ReactNode } from "react";

interface StatGridProps {
  cols?: 4 | 5;
  children: ReactNode;
}

export default function StatGrid({ cols = 4, children }: StatGridProps) {
  return (
    <section
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
    >
      {children}
    </section>
  );
}

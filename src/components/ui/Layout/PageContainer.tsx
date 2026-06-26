import type { ReactNode, HTMLAttributes } from "react";

const MAX_WIDTH = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-7xl",
  full: "max-w-full",
} as const;

export type PageContainerWidth = keyof typeof MAX_WIDTH;

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children:  ReactNode;
  maxWidth?: PageContainerWidth;
}

export function PageContainer({
  children,
  maxWidth = "xl",
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-4 sm:px-6",
        MAX_WIDTH[maxWidth],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

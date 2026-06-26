import type { ReactNode } from "react";

/* ── Size map ──────────────────────────────────────────────────────────── */
const SIZE_STYLES = {
  xs: { outer: "h-6  w-6  text-[9px]",  status: "h-1.5 w-1.5 ring-1"  },
  sm: { outer: "h-7  w-7  text-[10px]", status: "h-2   w-2   ring-1"  },
  md: { outer: "h-9  w-9  text-xs",     status: "h-2.5 w-2.5 ring-1"  },
  lg: { outer: "h-11 w-11 text-sm",     status: "h-3   w-3   ring-2"  },
  xl: { outer: "h-14 w-14 text-base",   status: "h-3.5 w-3.5 ring-2"  },
  "2xl": { outer: "h-20 w-20 text-xl",  status: "h-4   w-4   ring-2"  },
} as const;

export type AvatarSize = keyof typeof SIZE_STYLES;

const STATUS_COLOR: Record<string, string> = {
  online:  "bg-emerald-400",
  offline: "bg-slate-300",
  busy:    "bg-amber-400",
  away:    "bg-yellow-400",
};

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const PALETTE = [
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
  "bg-orange-600",
];
function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/* ── Avatar ────────────────────────────────────────────────────────────── */
export interface AvatarProps {
  name?:      string;
  src?:       string;
  size?:      AvatarSize;
  status?:    "online" | "offline" | "busy" | "away";
  className?: string;
}

export function Avatar({ name = "", src, size = "md", status, className = "" }: AvatarProps) {
  const { outer, status: statusSize } = SIZE_STYLES[size];
  const bg = colorFromName(name);

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <span
        className={`${outer} flex items-center justify-center rounded-full font-semibold text-white overflow-hidden ${src ? "" : bg}`}
      >
        {src
          ? <img src={src} alt={name} className="h-full w-full object-cover" />
          : toInitials(name) || "?"
        }
      </span>
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${statusSize} ${STATUS_COLOR[status] ?? "bg-slate-300"}`}
        />
      )}
    </span>
  );
}

/* ── AvatarGroup ───────────────────────────────────────────────────────── */
export interface AvatarGroupUser {
  name: string;
  src?: string;
}

export interface AvatarGroupProps {
  users:     AvatarGroupUser[];
  max?:      number;
  size?:     AvatarSize;
  children?: ReactNode;
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const { outer } = SIZE_STYLES[size];
  const visible  = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <span className="flex -space-x-1.5">
      {visible.map((u, i) => (
        <span key={i} title={u.name} className="ring-2 ring-white rounded-full">
          <Avatar name={u.name} src={u.src} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`${outer} flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold ring-2 ring-white`}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

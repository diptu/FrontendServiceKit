import { Activity, ShieldAlert, KeyRound, Gauge, type LucideIcon } from "lucide-react";

type ApiHealthStatus = "operational" | "degraded" | "outage";

interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  service: string;
  health: ApiHealthStatus;
}

interface HealthStyle {
  dot: string;
  text: string;
  label: string;
}

const HEALTH_STYLES: Record<ApiHealthStatus, HealthStyle> = {
  operational: {
    dot: "bg-green-500",
    text: "text-green-700",
    label: "Operational",
  },
  degraded: {
    dot: "bg-orange-500",
    text: "text-orange-700",
    label: "Degraded",
  },
  outage: {
    dot: "bg-red-500",
    text: "text-red-700",
    label: "Outage",
  },
};

const DEFAULT_METRICS: OverviewMetric[] = [
  {
    id: "active-connections",
    label: "Total Active Connections",
    value: "4,218",
    icon: Activity,
    service: "Session Gateway",
    health: "operational",
  },
  {
    id: "mfa-pending",
    label: "Pending MFA Enrollments",
    value: "37",
    icon: ShieldAlert,
    service: "MFA Enrollment Service",
    health: "degraded",
  },
  {
    id: "issued-tokens",
    label: "Issued Access Tokens",
    value: "12,904",
    icon: KeyRound,
    service: "Token Issuance Service",
    health: "operational",
  },
  {
    id: "avg-risk-score",
    label: "Average Session Risk Score",
    value: "0.18",
    icon: Gauge,
    service: "Risk Scoring Engine",
    health: "operational",
  },
];

interface OverviewGridProps {
  metrics?: OverviewMetric[];
}

export default function OverviewGrid({ metrics = DEFAULT_METRICS }: OverviewGridProps) {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const healthStyle = HEALTH_STYLES[metric.health];

        return (
          <div
            key={metric.id}
            className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-800">
                {metric.value}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
              <span className={`h-2 w-2 rounded-full ${healthStyle.dot}`} />
              <span className="text-xs font-medium text-slate-500">{metric.service}</span>
              <span className={`ml-auto text-xs font-semibold ${healthStyle.text}`}>
                {healthStyle.label}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

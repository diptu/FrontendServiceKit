import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { Plug, CheckCircle, XCircle, RefreshCw, Plus } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

type IntegrationStatus = "connected" | "disconnected" | "error";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  status: IntegrationStatus;
  lastSync?: string;
  connectedBy?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "i1",  name: "Slack",           category: "Communication", description: "Send alerts, access notifications, and approval requests to Slack channels.",        logo: "S",  status: "connected",    lastSync: "2 min ago",  connectedBy: "Sarah Mitchell"  },
  { id: "i2",  name: "GitHub",          category: "Dev Tools",     description: "Sync team members, enforce SSO, and audit repository access.",                        logo: "G",  status: "connected",    lastSync: "15 min ago", connectedBy: "James Chen"      },
  { id: "i3",  name: "Okta",            category: "Identity",      description: "Federation via SAML 2.0. Delegate authentication to your existing Okta directory.",   logo: "O",  status: "disconnected"                                                          },
  { id: "i4",  name: "Google Workspace",category: "Identity",      description: "Provision users and groups from Google Workspace via SCIM.",                          logo: "G",  status: "connected",    lastSync: "1 hr ago",   connectedBy: "Sarah Mitchell"  },
  { id: "i5",  name: "Datadog",         category: "Monitoring",    description: "Stream IAM audit events and session metrics to your Datadog account.",                logo: "D",  status: "error",        lastSync: "3 hr ago",   connectedBy: "James Chen"      },
  { id: "i6",  name: "PagerDuty",       category: "Alerting",      description: "Route critical security alerts and lockout events to PagerDuty on-call schedules.",   logo: "P",  status: "disconnected"                                                          },
  { id: "i7",  name: "Jira",            category: "Ticketing",     description: "Auto-create tickets for access requests and policy violations.",                      logo: "J",  status: "connected",    lastSync: "30 min ago", connectedBy: "James Chen"      },
  { id: "i8",  name: "Zapier",          category: "Automation",    description: "Connect NutraTenant events to 6,000+ apps via Zapier webhooks.",                     logo: "Z",  status: "disconnected"                                                          },
];

const LOGO_COLORS: Record<string, string> = {
  S: "bg-violet-600", G: "bg-indigo-600", O: "bg-blue-600",
  D: "bg-purple-600", P: "bg-green-600",  J: "bg-sky-600",
  Z: "bg-orange-600",
};

const STATUS_CONFIG: Record<IntegrationStatus, { icon: typeof CheckCircle; badge: string; label: string }> = {
  connected:    { icon: CheckCircle, badge: "bg-emerald-50 text-emerald-700", label: "Connected"    },
  disconnected: { icon: XCircle,     badge: "bg-slate-100 text-slate-500",    label: "Not connected" },
  error:        { icon: XCircle,     badge: "bg-red-50 text-red-700",         label: "Error"         },
};

const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

export default async function IntegrationsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  const connected    = INTEGRATIONS.filter(i => i.status === "connected").length;
  const disconnected = INTEGRATIONS.filter(i => i.status === "disconnected").length;
  const errors       = INTEGRATIONS.filter(i => i.status === "error").length;

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — connect/disconnect actions are disabled until role gates are enforced.
      </PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Plug className="h-5 w-5 text-indigo-500" />Integrations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Third-party connections for <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          <Plus className="h-4 w-4" />Browse Integrations
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Connected",     value: connected,    color: "text-emerald-600" },
          { label: "Disconnected",  value: disconnected, color: "text-slate-500"   },
          { label: "Errors",        value: errors,       color: "text-red-600"     },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration cards grouped by category */}
      {categories.map(category => (
        <div key={category}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEGRATIONS.filter(i => i.category === category).map(integration => {
              const cfg = STATUS_CONFIG[integration.status];
              const StatusIcon = cfg.icon;
              const logoColor = LOGO_COLORS[integration.logo] ?? "bg-slate-600";

              return (
                <div key={integration.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${logoColor} text-sm font-bold text-white`}>
                        {integration.logo}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{integration.name}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {integration.status === "connected" ? (
                      <div className="flex gap-1.5">
                        <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                          <RefreshCw className="h-3 w-3" />Sync
                        </button>
                        <button type="button" className="rounded-lg border border-red-100 px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors">
                          Disconnect
                        </button>
                      </div>
                    ) : integration.status === "error" ? (
                      <button type="button" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                        Reconnect
                      </button>
                    ) : (
                      <button type="button" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-500 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">{integration.description}</p>

                  {(integration.lastSync || integration.connectedBy) && (
                    <div className="mt-3 flex items-center gap-3 border-t border-slate-50 pt-3 text-[11px] text-slate-400">
                      {integration.lastSync    && <span>Last sync: {integration.lastSync}</span>}
                      {integration.connectedBy && <span>· Connected by {integration.connectedBy}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

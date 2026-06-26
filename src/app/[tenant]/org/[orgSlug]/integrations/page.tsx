import { Plug, RefreshCw, Plus } from "lucide-react";
import {
  Banner, Button, StatCard, StatusBadge,
  Card, CardHeader, CardBody, CardFooter,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

type IntegrationStatus = "connected" | "disconnected" | "error";

interface Integration {
  id: string; name: string; category: string; description: string;
  logo: string; status: IntegrationStatus; lastSync?: string; connectedBy?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "i1", name: "Slack",            category: "Communication", description: "Send alerts, access notifications, and approval requests to Slack channels.",      logo: "S", status: "connected",    lastSync: "2 min ago",  connectedBy: "Sarah Mitchell" },
  { id: "i2", name: "GitHub",           category: "Dev Tools",     description: "Sync team members, enforce SSO, and audit repository access.",                      logo: "G", status: "connected",    lastSync: "15 min ago", connectedBy: "James Chen"     },
  { id: "i3", name: "Okta",             category: "Identity",      description: "Federation via SAML 2.0. Delegate authentication to your existing Okta directory.", logo: "O", status: "disconnected"                                                           },
  { id: "i4", name: "Google Workspace", category: "Identity",      description: "Provision users and groups from Google Workspace via SCIM.",                        logo: "G", status: "connected",    lastSync: "1 hr ago",   connectedBy: "Sarah Mitchell" },
  { id: "i5", name: "Datadog",          category: "Monitoring",    description: "Stream IAM audit events and session metrics to your Datadog account.",              logo: "D", status: "error",        lastSync: "3 hr ago",   connectedBy: "James Chen"     },
  { id: "i6", name: "PagerDuty",        category: "Alerting",      description: "Route critical security alerts and lockout events to PagerDuty on-call schedules.", logo: "P", status: "disconnected"                                                           },
  { id: "i7", name: "Jira",             category: "Ticketing",     description: "Auto-create tickets for access requests and policy violations.",                    logo: "J", status: "connected",    lastSync: "30 min ago", connectedBy: "James Chen"     },
  { id: "i8", name: "Zapier",           category: "Automation",    description: "Connect NutraTenant events to 6,000+ apps via Zapier webhooks.",                   logo: "Z", status: "disconnected"                                                           },
];

const LOGO_BG: Record<string, string> = {
  S: "bg-violet-600", G: "bg-indigo-600", O: "bg-blue-600",
  D: "bg-purple-600", P: "bg-green-600",  J: "bg-sky-600", Z: "bg-orange-600",
};

const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

export default async function IntegrationsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display      = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const connected    = INTEGRATIONS.filter(i => i.status === "connected").length;
  const disconnected = INTEGRATIONS.filter(i => i.status === "disconnected").length;
  const errors       = INTEGRATIONS.filter(i => i.status === "error").length;

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — connect/disconnect actions are disabled until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Plug className="h-5 w-5 text-indigo-500" />Integrations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Third-party connections for <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus}>Browse Integrations</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Plug} label="Connected"    value={connected}    color="emerald" />
        <StatCard icon={Plug} label="Disconnected" value={disconnected} color="sky"     />
        <StatCard icon={Plug} label="Errors"       value={errors}       color="rose"    />
      </div>

      {categories.map(category => (
        <div key={category}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEGRATIONS.filter(i => i.category === category).map(integration => {
              const logoColor = LOGO_BG[integration.logo] ?? "bg-slate-600";
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader
                    title={integration.name}
                    icon={
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${logoColor} text-sm font-bold text-white`}>
                        {integration.logo}
                      </div>
                    }
                    action={<StatusBadge status={integration.status} dot />}
                  />
                  <CardBody>
                    <p className="text-xs leading-relaxed text-slate-500">{integration.description}</p>
                    {(integration.lastSync || integration.connectedBy) && (
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        {integration.lastSync    && <span>Last sync: {integration.lastSync}</span>}
                        {integration.connectedBy && <span>· by {integration.connectedBy}</span>}
                      </div>
                    )}
                  </CardBody>
                  <CardFooter align="right">
                    {integration.status === "connected" ? (
                      <>
                        <Button variant="secondary" size="sm" icon={RefreshCw}>Sync</Button>
                        <Button variant="danger"    size="sm">Disconnect</Button>
                      </>
                    ) : integration.status === "error" ? (
                      <Button variant="warning" size="sm">Reconnect</Button>
                    ) : (
                      <Button size="sm">Connect</Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

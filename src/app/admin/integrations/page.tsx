"use client";

import { useState } from "react";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  DetailPanel,
  DetailRow,
  PageHeader,
  PreviewBanner,
  SearchFilterBar,
  StatCard,
  StatGrid,
  StatusBadge,
} from "@/components/platform-admin/ui";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Edit2,
  Globe,
  Link2,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type IntStatus = "Connected" | "Disconnected" | "Pending" | "Error";

interface Integration {
  id: string; name: string; category: string; provider: string; status: IntStatus;
  enabledFor: string; lastSync: string; description: string; docsUrl: string;
  apiEndpoint: string; version: string; createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_INTEGRATIONS: Integration[] = [
  { id:"int01", name:"Azure AD / Microsoft Entra ID",  category:"Identity & Access Mgmt",  provider:"Microsoft",  status:"Connected",    enabledFor:"Apple Corp",                lastSync:"Jun 25, 2026 · 14:00", description:"Enterprise identity provider via SAML 2.0 and OAuth 2.0. Syncs users, groups, and role assignments.",   docsUrl:"https://docs.microsoft.com/entra",        apiEndpoint:"/v1/auth/saml/microsoft",   version:"2.0",    createdAt:"Mar 5, 2024"  },
  { id:"int02", name:"Okta Universal Directory",        category:"Identity & Access Mgmt",  provider:"Okta",       status:"Connected",    enabledFor:"Orange Teck",               lastSync:"Jun 25, 2026 · 13:45", description:"SCIM 2.0 user provisioning and SSO. Syncs user lifecycle events and group membership in real time.",    docsUrl:"https://developer.okta.com",              apiEndpoint:"/v1/auth/saml/okta",        version:"SCIM 2.0",createdAt:"May 1, 2024"  },
  { id:"int03", name:"AWS IAM Identity Center",         category:"Cloud Services",          provider:"AWS",        status:"Connected",    enabledFor:"All Tenants",               lastSync:"Jun 25, 2026 · 14:10", description:"Centralised AWS SSO and permission management across all tenant workloads deployed on AWS.",               docsUrl:"https://docs.aws.amazon.com/singlesignon",apiEndpoint:"/v1/cloud/aws/sso",         version:"v2",     createdAt:"Jan 15, 2024" },
  { id:"int04", name:"Slack Workspace",                 category:"Communication",           provider:"Slack",      status:"Connected",    enabledFor:"Apple Corp, Orange Teck",   lastSync:"Jun 25, 2026 · 14:05", description:"Sends IAM alerts, provisioning notifications, and security event summaries to designated Slack channels.", docsUrl:"https://api.slack.com",                   apiEndpoint:"/v1/notify/slack",          version:"v2",     createdAt:"Apr 1, 2024"  },
  { id:"int05", name:"PagerDuty On-Call",               category:"Monitoring & Alerting",   provider:"PagerDuty",  status:"Connected",    enabledFor:"All Tenants",               lastSync:"Jun 25, 2026 · 13:50", description:"Escalates critical security events and infrastructure alerts to on-call engineering rotations.",          docsUrl:"https://developer.pagerduty.com",         apiEndpoint:"/v1/alert/pagerduty",       version:"v2",     createdAt:"Apr 10, 2024" },
  { id:"int06", name:"Zendesk Support",                 category:"Support",                 provider:"Zendesk",    status:"Connected",    enabledFor:"All Tenants",               lastSync:"Jun 25, 2026 · 12:30", description:"Auto-creates Zendesk tickets for tenant provisioning requests and high-severity security events.",       docsUrl:"https://developer.zendesk.com",           apiEndpoint:"/v1/support/zendesk",       version:"v2",     createdAt:"May 15, 2024" },
  { id:"int07", name:"Datadog APM",                     category:"Monitoring & Alerting",   provider:"Datadog",    status:"Connected",    enabledFor:"All Tenants",               lastSync:"Jun 25, 2026 · 14:12", description:"Exports platform metrics, traces, and logs to Datadog for full-stack observability and anomaly detection.", docsUrl:"https://docs.datadoghq.com",              apiEndpoint:"/v1/metrics/datadog",       version:"v2",     createdAt:"Jun 1, 2024"  },
  { id:"int08", name:"Amazon S3 Object Storage",        category:"Cloud Storage",           provider:"AWS",        status:"Connected",    enabledFor:"All Tenants",               lastSync:"Jun 25, 2026 · 11:00", description:"Stores audit log archives, compliance exports, and document backups in tenant-isolated S3 buckets.",       docsUrl:"https://docs.aws.amazon.com/s3",          apiEndpoint:"/v1/storage/s3",            version:"v4",     createdAt:"Jan 15, 2024" },
  { id:"int09", name:"Google Workspace",                category:"Identity & Access Mgmt",  provider:"Google",     status:"Pending",      enabledFor:"Banana Republic",           lastSync:"—",                    description:"OAuth 2.0 SSO and SCIM provisioning via Google Workspace. Awaiting domain verification.",                  docsUrl:"https://developers.google.com/workspace", apiEndpoint:"/v1/auth/saml/google",      version:"OAuth 2.0",createdAt:"Jun 20, 2026" },
  { id:"int10", name:"Stripe Billing",                  category:"Payments",                provider:"Stripe",     status:"Connected",    enabledFor:"All Tenants",               lastSync:"Jun 25, 2026 · 13:00", description:"Manages subscription billing, invoice generation, payment processing, and plan upgrades.",               docsUrl:"https://stripe.com/docs",                 apiEndpoint:"/v1/billing/stripe",        version:"v1",     createdAt:"Jan 20, 2024" },
  { id:"int11", name:"GitHub Actions CI",               category:"CI/CD",                   provider:"GitHub",     status:"Disconnected", enabledFor:"—",                         lastSync:"May 10, 2026",         description:"Was used for automated tenant provisioning scripts. Disconnected during platform migration.",               docsUrl:"https://docs.github.com/actions",         apiEndpoint:"/v1/cicd/github",           version:"v1",     createdAt:"Feb 1, 2024"  },
  { id:"int12", name:"Twilio SMS & Voice",              category:"Communication",           provider:"Twilio",     status:"Error",        enabledFor:"All Tenants",               lastSync:"Jun 24, 2026 · 09:00", description:"Delivers SMS-based MFA codes and critical security alerts. Auth error — API key rotation required.",       docsUrl:"https://www.twilio.com/docs",             apiEndpoint:"/v1/notify/sms/twilio",     version:"v2010",  createdAt:"Mar 20, 2024" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<IntStatus, string> = {
  Connected:    "bg-emerald-50 text-emerald-700",
  Disconnected: "bg-slate-100 text-slate-500",
  Pending:      "bg-amber-50 text-amber-700",
  Error:        "bg-red-50 text-red-700",
};

const PROVIDER_COLORS: Record<string, string> = {
  Microsoft:"bg-blue-50 text-blue-700",   Okta:"bg-blue-50 text-blue-700",
  AWS:"bg-orange-50 text-orange-700",     Slack:"bg-violet-50 text-violet-700",
  PagerDuty:"bg-emerald-50 text-emerald-700", Zendesk:"bg-green-50 text-green-700",
  Datadog:"bg-purple-50 text-purple-700", Google:"bg-red-50 text-red-700",
  Stripe:"bg-indigo-50 text-indigo-700",  GitHub:"bg-slate-100 text-slate-700",
  Twilio:"bg-red-50 text-red-700",
};

const CATEGORIES  = ["All Categories","Identity & Access Mgmt","Cloud Services","Communication","Monitoring & Alerting","Support","Cloud Storage","Payments","CI/CD"];
const PROVIDERS   = ["All Providers","Microsoft","Okta","AWS","Slack","PagerDuty","Zendesk","Datadog","Google","Stripe","GitHub","Twilio"];
const STATUSES    = ["All Status","Connected","Disconnected","Pending","Error"];

// ─── Add/Edit form ────────────────────────────────────────────────────────────

interface IntFormProps { initial?: Integration | null; onClose: () => void }

function IntegrationForm({ initial, onClose }: IntFormProps) {
  const [name,     setName]     = useState(initial?.name     ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Identity & Access Mgmt");
  const [provider, setProvider] = useState(initial?.provider ?? "Microsoft");
  const [tenant,   setTenant]   = useState(initial?.enabledFor?? "All Tenants");
  const [desc,     setDesc]     = useState(initial?.description ?? "");
  const [endpoint, setEndpoint] = useState(initial?.apiEndpoint ?? "");

  return (
    <div className="flex flex-col gap-3 p-0.5">
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Integration Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Okta Universal Directory" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Provider</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          {PROVIDERS.slice(1).map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Enabled For Tenant</label>
        <select value={tenant} onChange={(e) => setTenant(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          {["All Tenants","Apple Corp","Orange Teck","Banana Republic"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">API Endpoint</label>
        <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="/v1/auth/saml/provider" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="What does this integration do?" className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">
          {initial ? "Save Changes" : "Add Connector"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [selected,       setSelected]       = useState<Integration | null>(null);
  const [showForm,       setShowForm]       = useState(false);
  const [search,         setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [providerFilter, setProviderFilter] = useState("All Providers");
  const [statusFilter,   setStatusFilter]   = useState("All Status");

  const filtered = MOCK_INTEGRATIONS.filter((i) => {
    const ms  = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.provider.toLowerCase().includes(search.toLowerCase());
    const mc  = categoryFilter === "All Categories" || i.category === categoryFilter;
    const mp  = providerFilter === "All Providers"  || i.provider === providerFilter;
    const mst = statusFilter   === "All Status"     || i.status   === statusFilter;
    return ms && mc && mp && mst;
  });

  const connected    = MOCK_INTEGRATIONS.filter((i) => i.status === "Connected").length;
  const disconnected = MOCK_INTEGRATIONS.filter((i) => i.status === "Disconnected").length;
  const errorCount   = MOCK_INTEGRATIONS.filter((i) => i.status === "Error").length;

  const panelOpen = !!selected || showForm;

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Integrations management. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Integrations"
          subtitle="Manage third-party integrations and system connections across the platform."
          actions={
            <>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                <RefreshCw className="h-4 w-4" /> Sync All
              </button>
              <button type="button" onClick={() => { setSelected(null); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                <Plus className="h-4 w-4" /> Add Integration
              </button>
            </>
          }
        />

        <StatGrid cols={4}>
          <StatCard icon={Plug}         value={MOCK_INTEGRATIONS.length} label="Total Integrations" sub="Platform-wide"       bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={CheckCircle2} value={connected}                 label="Connected"          sub="Active connectors"   bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Zap}          value={disconnected}              label="Disconnected"        sub="Inactive connectors" bg="bg-slate-100"  color="text-slate-500"   />
          <StatCard icon={XCircle}      value={errorCount}                label="Errors"             sub="Need attention"      bg="bg-red-50"     color="text-red-600"     />
        </StatGrid>

        <div className="flex gap-6">
          {/* Table */}
          <div className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${panelOpen ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <p className="text-sm font-semibold text-slate-900">All Integrations</p>
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search integrations…" className="h-8 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                </select>
                <select value={statusFilter}   onChange={(e) => setStatusFilter(e.target.value)}   className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {STATUSES.map((s)  => <option key={s}>{s}</option>)}
                </select>
              </SearchFilterBar>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Integration Name","Category","Provider","Status","Enabled For","Last Sync","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">No integrations match your filters.</td></tr>
                  )}
                  {filtered.map((int) => (
                    <tr key={int.id} onClick={() => { setShowForm(false); setSelected((p) => p?.id === int.id ? null : int); }} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === int.id ? "bg-green-50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">{int.provider.charAt(0)}</div>
                          <div>
                            <p className="font-semibold text-slate-900 max-w-[180px] truncate">{int.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{int.apiEndpoint}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{int.category}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PROVIDER_COLORS[int.provider] ?? "bg-slate-100 text-slate-600"}`}>{int.provider}</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={int.status} colorMap={STATUS_COLORS} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[160px] truncate">{int.enabledFor}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{int.lastSync}</td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => { setSelected(int); setShowForm(false); }} className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_INTEGRATIONS.length} integrations</p>
            </div>
          </div>

          {/* Right panel: edit existing */}
          {selected && !showForm && (
            <DetailPanel
              title={selected.name}
              badge={<StatusBadge status={selected.status} colorMap={STATUS_COLORS} />}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Save Changes</button>
                  {selected.status === "Connected" && (
                    <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Disconnect</button>
                  )}
                </div>
              }
            >
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Tag}      label="Category"    value={selected.category}                                        />
              <DetailRow icon={Building2}label="Provider"    value={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${PROVIDER_COLORS[selected.provider] ?? "bg-slate-100 text-slate-600"}`}>{selected.provider}</span>} />
              <DetailRow icon={Globe}    label="Enabled For" value={selected.enabledFor}                                      />
              <DetailRow icon={Link2}    label="API Endpoint"value={<span className="font-mono text-[11px]">{selected.apiEndpoint}</span>} />
              <DetailRow icon={Zap}      label="Version"     value={selected.version}                                         />
              <DetailRow icon={Calendar} label="Last Sync"   value={selected.lastSync}                                        />
              <DetailRow icon={Calendar} label="Added"       value={selected.createdAt}                                       />
              {selected.status === "Error" && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700">Connection Error</p>
                  <p className="mt-0.5 text-xs text-red-600">Authentication failure — API key may have been rotated. Update credentials to restore connectivity.</p>
                  <button type="button" className="mt-2 w-full rounded-md bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Update Credentials</button>
                </div>
              )}
            </DetailPanel>
          )}

          {/* Right panel: add new */}
          {showForm && !selected && (
            <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Add New Integration</h3>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                <IntegrationForm onClose={() => setShowForm(false)} />
              </div>
            </div>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

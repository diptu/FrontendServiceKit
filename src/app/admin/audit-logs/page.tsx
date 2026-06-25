"use client";

import { useMemo, useState } from "react";
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
  TabBar,
} from "@/components/platform-admin/ui";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Globe,
  Hash,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  Tag,
  User,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Outcome    = "Success" | "Failed" | "Warning";
type EventAction=
  | "user.login"     | "user.logout"     | "user.create"    | "user.update"
  | "user.delete"    | "user.mfa_enabled"| "user.lock"      | "user.unlock"
  | "policy.create"  | "policy.update"   | "policy.delete"
  | "document.read"  | "document.write"  | "document.delete"
  | "tenant.create"  | "tenant.update"   | "tenant.suspend"
  | "role.assign"    | "role.revoke"
  | "session.expired"| "session.start"
  | "billing.update" | "provisioning.start";

interface AuditEvent {
  id: string; ts: string; user: string; tenant: string; tenantId: string;
  ip: string; resource: string; action: EventAction; outcome: Outcome;
  userAgent: string; details: Record<string, string | number | boolean>;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: AuditEvent[] = [
  { id:"ev001", ts:"Jun 25, 2026 · 14:32:09", user:"alice.johnson@applecorp.test",      tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.42",   resource:"users",        action:"user.create",      outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"new.hire@applecorp.test", role:"Member", clearance:1 } },
  { id:"ev002", ts:"Jun 25, 2026 · 14:28:55", user:"admin@nutratenant.test",            tenant:"All Tenants",      tenantId:"platform",        ip:"10.0.0.1",       resource:"policies",     action:"policy.update",    outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ policy_id:"ab3", field:"conditions", change:"added clearance>=2" } },
  { id:"ev003", ts:"Jun 25, 2026 · 14:15:20", user:"bob.smith@applecorp.test",          tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.44",   resource:"documents",    action:"document.read",    outcome:"Success", userAgent:"Mozilla/5.0 Safari/17",    details:{ doc_id:"doc-8821", doc_title:"Q2 Nutrition Report", clearance_required:2 } },
  { id:"ev004", ts:"Jun 25, 2026 · 14:10:03", user:"ops.lead@orangeteck.test",          tenant:"Orange Teck",      tenantId:"orange_teck",     ip:"172.16.0.22",    resource:"users",        action:"user.update",      outcome:"Success", userAgent:"Mozilla/5.0 Firefox/126",  details:{ target_user:"dev.a@orangeteck.test", field:"clearance", old_value:2, new_value:3 } },
  { id:"ev005", ts:"Jun 25, 2026 · 13:58:42", user:"staff.a@bananarepublic.test",       tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.5",    resource:"documents",    action:"document.write",   outcome:"Failed",  userAgent:"Mozilla/5.0 Chrome/125",   details:{ doc_id:"doc-4412", reason:"Insufficient clearance level", required:3, actual:1 } },
  { id:"ev006", ts:"Jun 25, 2026 · 13:52:17", user:"admin@orangeteck.test",             tenant:"Orange Teck",      tenantId:"orange_teck",     ip:"172.16.0.1",     resource:"roles",        action:"role.assign",      outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"tech.lead@orangeteck.test", role:"Tech Lead", granted_by:"admin@orangeteck.test" } },
  { id:"ev007", ts:"Jun 25, 2026 · 13:47:05", user:"dave.chen@applecorp.test",          tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.53",   resource:"session",      action:"user.login",       outcome:"Success", userAgent:"Mozilla/5.0 Safari/17",    details:{ mfa_method:"TOTP", mfa_verified:true, session_id:"sess-9182" } },
  { id:"ev008", ts:"Jun 25, 2026 · 13:40:30", user:"finance.a@bananarepublic.test",     tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.8",    resource:"documents",    action:"document.read",    outcome:"Success", userAgent:"Mozilla/5.0 Firefox/126",  details:{ doc_id:"doc-7713", doc_title:"BR Finance Report Q1", clearance_required:3 } },
  { id:"ev009", ts:"Jun 25, 2026 · 13:35:19", user:"alice.johnson@applecorp.test",      tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.42",   resource:"policies",     action:"policy.create",    outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ policy_id:"ab-new-1", policy_name:"Finance Document Policy v2", effect:"ALLOW" } },
  { id:"ev010", ts:"Jun 25, 2026 · 13:22:08", user:"unknown@external.test",             tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"185.220.101.34", resource:"session",      action:"user.login",       outcome:"Failed",  userAgent:"python-requests/2.31",     details:{ reason:"Invalid credentials", attempts:3, ip_flagged:true } },
  { id:"ev011", ts:"Jun 25, 2026 · 13:18:55", user:"admin@bananarepublic.test",         tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.1",    resource:"users",        action:"user.mfa_enabled", outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"staff.b@bananarepublic.test", mfa_method:"TOTP", enforced_by:"admin" } },
  { id:"ev012", ts:"Jun 25, 2026 · 13:05:44", user:"admin@nutratenant.test",            tenant:"All Tenants",      tenantId:"platform",        ip:"10.0.0.1",       resource:"tenants",      action:"tenant.suspend",   outcome:"Warning", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_tenant:"metavit", reason:"Payment overdue", notified:true } },
  { id:"ev013", ts:"Jun 25, 2026 · 12:58:11", user:"bob.smith@applecorp.test",          tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.44",   resource:"session",      action:"session.expired",  outcome:"Warning", userAgent:"Mozilla/5.0 Safari/17",    details:{ session_id:"sess-7744", idle_minutes:31, auto_logout:true } },
  { id:"ev014", ts:"Jun 25, 2026 · 12:44:28", user:"tech.lead@orangeteck.test",         tenant:"Orange Teck",      tenantId:"orange_teck",     ip:"172.16.0.15",    resource:"policies",     action:"policy.delete",    outcome:"Success", userAgent:"Mozilla/5.0 Firefox/126",  details:{ policy_id:"ab-legacy-3", policy_name:"Legacy Access v1", deleted_by:"tech.lead@orangeteck.test" } },
  { id:"ev015", ts:"Jun 25, 2026 · 12:30:00", user:"ops.lead@orangeteck.test",          tenant:"Orange Teck",      tenantId:"orange_teck",     ip:"172.16.0.22",    resource:"users",        action:"user.lock",        outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"dev.b@orangeteck.test", reason:"Suspicious login attempt", lock_expires:"never" } },
  { id:"ev016", ts:"Jun 25, 2026 · 12:15:39", user:"admin@nutratenant.test",            tenant:"All Tenants",      tenantId:"platform",        ip:"10.0.0.1",       resource:"tenants",      action:"tenant.create",    outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ tenant_id:"greenvalley", plan:"enterprise", provisioned_by:"admin@nutratenant.test" } },
  { id:"ev017", ts:"Jun 25, 2026 · 12:00:15", user:"alice.johnson@applecorp.test",      tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.42",   resource:"documents",    action:"document.delete",  outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ doc_id:"doc-2201", doc_title:"Archived Policy v1", purge:false } },
  { id:"ev018", ts:"Jun 25, 2026 · 11:48:02", user:"finance.b@bananarepublic.test",     tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.9",    resource:"documents",    action:"document.write",   outcome:"Failed",  userAgent:"Mozilla/5.0 Safari/17",    details:{ doc_id:"doc-9901", reason:"Policy 'Cross-Tenant Isolation' denied write", policy:"ab3" } },
  { id:"ev019", ts:"Jun 25, 2026 · 11:35:20", user:"admin@orangeteck.test",             tenant:"Orange Teck",      tenantId:"orange_teck",     ip:"172.16.0.1",     resource:"roles",        action:"role.revoke",      outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"dev.a@orangeteck.test", role:"Junior Developer", revoked_by:"admin@orangeteck.test" } },
  { id:"ev020", ts:"Jun 25, 2026 · 11:20:04", user:"dave.chen@applecorp.test",          tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.53",   resource:"session",      action:"user.logout",      outcome:"Success", userAgent:"Mozilla/5.0 Safari/17",    details:{ session_id:"sess-9182", session_duration_min:73 } },
  { id:"ev021", ts:"Jun 25, 2026 · 11:10:55", user:"admin@nutratenant.test",            tenant:"All Tenants",      tenantId:"platform",        ip:"10.0.0.1",       resource:"billing",      action:"billing.update",   outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ tenant:"orange_teck", plan_old:"starter", plan_new:"growth", price_change:"+427" } },
  { id:"ev022", ts:"Jun 25, 2026 · 10:58:33", user:"staff.c@bananarepublic.test",       tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.6",    resource:"session",      action:"user.login",       outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ mfa_method:"Email", mfa_verified:true, session_id:"sess-6633" } },
  { id:"ev023", ts:"Jun 25, 2026 · 10:45:18", user:"alice.johnson@applecorp.test",      tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.42",   resource:"users",        action:"user.update",      outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"bob.smith@applecorp.test", field:"department", old_value:"Engineering", new_value:"Product" } },
  { id:"ev024", ts:"Jun 25, 2026 · 10:30:07", user:"admin@nutratenant.test",            tenant:"All Tenants",      tenantId:"platform",        ip:"10.0.0.1",       resource:"provisioning", action:"provisioning.start",outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ tenant_id:"vitaltrack", plan:"growth", initiated_by:"admin@nutratenant.test" } },
  { id:"ev025", ts:"Jun 25, 2026 · 10:18:44", user:"ops.lead@orangeteck.test",          tenant:"Orange Teck",      tenantId:"orange_teck",     ip:"172.16.0.22",    resource:"users",        action:"user.delete",      outcome:"Warning", userAgent:"Mozilla/5.0 Firefox/126",  details:{ target_user:"former.emp@orangeteck.test", data_retained:true, reason:"Employment ended" } },
  { id:"ev026", ts:"Jun 25, 2026 · 10:05:29", user:"bob.smith@applecorp.test",          tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.44",   resource:"session",      action:"user.login",       outcome:"Success", userAgent:"Mozilla/5.0 Safari/17",    details:{ mfa_method:"TOTP", mfa_verified:true, session_id:"sess-2244" } },
  { id:"ev027", ts:"Jun 25, 2026 · 09:55:12", user:"admin@bananarepublic.test",         tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.1",    resource:"users",        action:"user.create",      outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"new.staff@bananarepublic.test", role:"User", clearance:1 } },
  { id:"ev028", ts:"Jun 25, 2026 · 09:40:00", user:"admin@nutratenant.test",            tenant:"All Tenants",      tenantId:"platform",        ip:"10.0.0.1",       resource:"policies",     action:"policy.update",    outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ policy_id:"ab1", field:"conditions", change:"clearance requirement raised to 5" } },
  { id:"ev029", ts:"Jun 25, 2026 · 09:28:35", user:"finance.a@bananarepublic.test",     tenant:"Banana Republic",  tenantId:"banana_republic", ip:"203.0.113.8",    resource:"session",      action:"session.expired",  outcome:"Warning", userAgent:"Mozilla/5.0 Firefox/126",  details:{ session_id:"sess-8801", idle_minutes:62, auto_logout:true } },
  { id:"ev030", ts:"Jun 25, 2026 · 09:10:20", user:"alice.johnson@applecorp.test",      tenant:"Apple Corp",       tenantId:"apple_corp",      ip:"192.168.1.42",   resource:"users",        action:"user.unlock",      outcome:"Success", userAgent:"Mozilla/5.0 Chrome/125",   details:{ target_user:"carol.jones@applecorp.test", unlocked_by:"alice.johnson@applecorp.test" } },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const OUTCOME_COLORS: Record<Outcome, string> = {
  Success: "bg-emerald-50 text-emerald-700",
  Failed:  "bg-red-50 text-red-700",
  Warning: "bg-amber-50 text-amber-700",
};

const ACTION_MODULE: Record<string, string> = {
  user:          "bg-blue-50 text-blue-700",
  policy:        "bg-violet-50 text-violet-700",
  document:      "bg-amber-50 text-amber-700",
  tenant:        "bg-cyan-50 text-cyan-700",
  role:          "bg-emerald-50 text-emerald-700",
  session:       "bg-slate-100 text-slate-600",
  billing:       "bg-orange-50 text-orange-700",
  provisioning:  "bg-pink-50 text-pink-700",
};

const EVENT_TABS = ["All Events", "User Events", "Policy Events", "Tenant Events", "Role Events", "Session Events"] as const;
type EventTab = typeof EVENT_TABS[number];

const TAB_FILTER: Record<EventTab, (a: EventAction) => boolean> = {
  "All Events":     ()  => true,
  "User Events":    (a) => a.startsWith("user."),
  "Policy Events":  (a) => a.startsWith("policy."),
  "Tenant Events":  (a) => a.startsWith("tenant.") || a.startsWith("billing.") || a.startsWith("provisioning."),
  "Role Events":    (a) => a.startsWith("role."),
  "Session Events": (a) => a.startsWith("session."),
};

const PAGE_SIZE = 10;
const TENANTS   = ["All Tenants", "Apple Corp", "Orange Teck", "Banana Republic"];
const OUTCOMES  = ["All Results", "Success", "Failed", "Warning"];
const RESOURCES = ["All Resources", "users", "policies", "documents", "session", "roles", "tenants", "billing", "provisioning"];

const UNIQUE_USERS    = [...new Set(MOCK_EVENTS.map((e) => e.user))].length;
const UNIQUE_EVENT_TYPES = [...new Set(MOCK_EVENTS.map((e) => e.action.split(".")[0]))].length;
const UNIQUE_RESOURCES   = [...new Set(MOCK_EVENTS.map((e) => e.resource))].length;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [activeTab,     setActiveTab]     = useState<EventTab>("All Events");
  const [search,        setSearch]        = useState("");
  const [tenantFilter,  setTenantFilter]  = useState("All Tenants");
  const [outcomeFilter, setOutcomeFilter] = useState("All Results");
  const [resourceFilter,setResourceFilter]= useState("All Resources");
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState<AuditEvent | null>(null);

  const filtered = useMemo(() => MOCK_EVENTS.filter((ev) => {
    const matchTab      = TAB_FILTER[activeTab](ev.action);
    const matchSearch   = !search || ev.user.toLowerCase().includes(search.toLowerCase()) || ev.action.toLowerCase().includes(search.toLowerCase()) || ev.tenant.toLowerCase().includes(search.toLowerCase());
    const matchTenant   = tenantFilter   === "All Tenants"    || ev.tenant   === tenantFilter;
    const matchOutcome  = outcomeFilter  === "All Results"    || ev.outcome  === outcomeFilter;
    const matchResource = resourceFilter === "All Resources"  || ev.resource === resourceFilter;
    return matchTab && matchSearch && matchTenant && matchOutcome && matchResource;
  }), [activeTab, search, tenantFilter, outcomeFilter, resourceFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tabCounts   = Object.fromEntries(
    EVENT_TABS.map((t) => [t, MOCK_EVENTS.filter((ev) => TAB_FILTER[t](ev.action)).length])
  ) as Record<EventTab, number>;

  function changeTab(label: string) {
    setActiveTab(label as EventTab);
    setPage(1);
    setSelected(null);
  }

  function selectRow(ev: AuditEvent) {
    setSelected((prev) => (prev?.id === ev.id ? null : ev));
  }

  function resetFilters() {
    setSearch(""); setTenantFilter("All Tenants"); setOutcomeFilter("All Results");
    setResourceFilter("All Resources"); setPage(1); setSelected(null);
  }

  const actionModule = (action: EventAction) => action.split(".")[0];

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Audit Logs. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Audit Logs"
          subtitle="Track and monitor all system and tenant activity across tenants and topics."
          actions={
            <>
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                <RefreshCw className="h-4 w-4" /> Reset
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                <Download className="h-4 w-4" /> Export Logs
              </button>
            </>
          }
        />

        {/* KPI strip */}
        <StatGrid cols={5}>
          <StatCard icon={ScrollText} value={MOCK_EVENTS.length.toLocaleString()} label="Total Events"   sub="All time"               bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={Users}      value={UNIQUE_USERS}                          label="Active Users"  sub="Across all events"       bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={Activity}   value={filtered.length}                       label="Filtered"      sub="Current view"            bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Tag}        value={UNIQUE_EVENT_TYPES}                    label="Event Types"   sub="Distinct modules"        bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Shield}     value={UNIQUE_RESOURCES}                      label="Resources"     sub="Distinct resource kinds"  bg="bg-slate-100"  color="text-slate-600"   />
        </StatGrid>

        {/* Main content area */}
        <div className="flex gap-6">
          {/* Table card */}
          <div className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>

            {/* Tabs */}
            <div className="border-b border-slate-100 px-5 pt-4">
              <TabBar
                tabs={EVENT_TABS.map((t) => ({ label: t, count: tabCounts[t] }))}
                active={activeTab}
                onChange={changeTab}
                variant="underline"
              />
            </div>

            {/* Filters */}
            <div className="border-b border-slate-100 px-5 py-3">
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search user, action, tenant…"
                      className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                }
              >
                <select value={tenantFilter}   onChange={(e) => { setTenantFilter(e.target.value);   setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TENANTS.map((t)   => <option key={t}>{t}</option>)}
                </select>
                <select value={outcomeFilter}  onChange={(e) => { setOutcomeFilter(e.target.value);  setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {OUTCOMES.map((o)  => <option key={o}>{o}</option>)}
                </select>
                <select value={resourceFilter} onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {RESOURCES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <button type="button" onClick={resetFilters} className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 hover:bg-slate-50">
                  Reset
                </button>
              </SearchFilterBar>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Date / Time","User","Tenant","IP Address","Resource","Action","Outcome"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">No audit events match your filters.</td>
                    </tr>
                  )}
                  {paginated.map((ev) => {
                    const mod = actionModule(ev.action);
                    return (
                      <tr
                        key={ev.id}
                        onClick={() => selectRow(ev)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === ev.id ? "bg-green-50" : ""}`}
                      >
                        <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 shrink-0 text-slate-300" />
                            {ev.ts}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                              {ev.user.charAt(0).toUpperCase()}
                            </div>
                            <span className="max-w-[160px] truncate text-xs font-medium text-slate-800">{ev.user}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">{ev.tenant}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{ev.ip}</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_MODULE[mod] ?? "bg-slate-100 text-slate-600"}`}>{ev.resource}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-slate-700">{ev.action}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={ev.outcome} colorMap={OUTCOME_COLORS} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">
                {filtered.length === 0
                  ? "No results"
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} events`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium ${
                      p === page
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <DetailPanel
              title="Event Details"
              badge={<StatusBadge status={selected.outcome} colorMap={OUTCOME_COLORS} />}
              onClose={() => setSelected(null)}
              footer={
                <button type="button" className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Copy Event ID
                </button>
              }
            >
              <DetailRow icon={Hash}      label="Event ID"   value={<span className="font-mono text-xs">{selected.id}</span>}      />
              <DetailRow icon={Clock}     label="Timestamp"  value={selected.ts}                                                    />
              <DetailRow icon={User}      label="User"       value={<span className="truncate text-xs">{selected.user}</span>}      />
              <DetailRow icon={Globe}     label="IP Address" value={<span className="font-mono text-xs">{selected.ip}</span>}       />
              <DetailRow icon={Tag}       label="Resource"   value={selected.resource}                                              />
              <DetailRow icon={Activity}  label="Action"     value={<span className="font-mono text-xs">{selected.action}</span>}   />
              <DetailRow icon={Calendar}  label="Tenant"     value={selected.tenant}                                                />

              {/* Details JSON block */}
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Event Payload</p>
                <div className="rounded-lg border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(selected.details, null, 2)}
                  </pre>
                </div>
              </div>

              {/* User agent */}
              <div className="mt-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">User Agent</p>
                <p className="text-[11px] text-slate-500 break-all">{selected.userAgent}</p>
              </div>
            </DetailPanel>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

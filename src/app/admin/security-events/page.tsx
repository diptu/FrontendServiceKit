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
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Globe,
  Hash,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity   = "Critical" | "High" | "Medium" | "Low" | "Info";
type EventStatus= "New" | "Active" | "Investigating" | "Resolved" | "Dismissed";

interface SecurityEvent {
  id: string; date: string; eventType: string; severity: Severity;
  description: string; source: string; accountId: string; tenant: string;
  country: string; countryCode: string; ip: string; status: EventStatus;
  relatedIps: string[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: SecurityEvent[] = [
  { id:"SE-001", date:"Jun 25, 2026 · 14:22:18", eventType:"Brute Force Attack",       severity:"Critical", description:"248 failed login attempts from single IP in 3 minutes.",                tenant:"Apple Corp",       accountId:"apple_corp",      source:"alice.johnson@applecorp.test",      country:"Russia",         countryCode:"RU", ip:"185.220.101.34", status:"Active",        relatedIps:["185.220.101.34","185.220.101.35","185.220.101.36"] },
  { id:"SE-002", date:"Jun 25, 2026 · 14:15:03", eventType:"Policy Violation",         severity:"High",     description:"Admin attempted to access audit_logs with clearance level 1.",          tenant:"Apple Corp",       accountId:"apple_corp",      source:"bob.smith@applecorp.test",          country:"United States",  countryCode:"US", ip:"192.168.1.44",   status:"Investigating", relatedIps:["192.168.1.44"] },
  { id:"SE-003", date:"Jun 25, 2026 · 13:58:42", eventType:"Suspicious IP",            severity:"Medium",   description:"Login from an IP not previously seen for this account.",                tenant:"Orange Teck",      accountId:"orange_teck",     source:"tech.lead@orangeteck.test",         country:"China",          countryCode:"CN", ip:"103.235.46.12",  status:"New",           relatedIps:["103.235.46.12"] },
  { id:"SE-004", date:"Jun 25, 2026 · 13:47:05", eventType:"MFA Bypass Attempt",       severity:"Critical", description:"JWT token submitted without MFA claim; request blocked by SecurityGuard.",tenant:"All Tenants",      accountId:"platform",        source:"unknown@external.test",             country:"Germany",        countryCode:"DE", ip:"91.108.56.149",  status:"Active",        relatedIps:["91.108.56.149","91.108.56.150"] },
  { id:"SE-005", date:"Jun 25, 2026 · 13:35:19", eventType:"Unauthorized Access",      severity:"High",     description:"Cross-tenant resource access blocked by ABAC policy ab3.",               tenant:"Banana Republic",  accountId:"banana_republic", source:"staff.a@bananarepublic.test",       country:"Brazil",         countryCode:"BR", ip:"177.42.180.55",  status:"Resolved",      relatedIps:["177.42.180.55"] },
  { id:"SE-006", date:"Jun 25, 2026 · 13:22:08", eventType:"Account Takeover Attempt", severity:"Critical", description:"Password reset token used from unrecognised device and country.",        tenant:"Apple Corp",       accountId:"apple_corp",      source:"carol.jones@applecorp.test",        country:"North Korea",    countryCode:"KP", ip:"175.45.176.1",   status:"Active",        relatedIps:["175.45.176.1","175.45.176.2"] },
  { id:"SE-007", date:"Jun 25, 2026 · 13:10:55", eventType:"Rate Limit Exceeded",      severity:"Medium",   description:"API endpoint /policies hit 1,200 req/min; threshold is 200.",            tenant:"Orange Teck",      accountId:"orange_teck",     source:"ops.lead@orangeteck.test",          country:"United States",  countryCode:"US", ip:"172.16.0.22",    status:"Resolved",      relatedIps:["172.16.0.22"] },
  { id:"SE-008", date:"Jun 25, 2026 · 12:58:11", eventType:"Session Hijack Attempt",   severity:"High",     description:"Session token replayed from a different IP than the issuing request.",   tenant:"Apple Corp",       accountId:"apple_corp",      source:"dave.chen@applecorp.test",          country:"Netherlands",    countryCode:"NL", ip:"94.140.14.14",   status:"Investigating", relatedIps:["94.140.14.14","94.140.14.15"] },
  { id:"SE-009", date:"Jun 25, 2026 · 12:44:28", eventType:"Privilege Escalation",     severity:"Critical", description:"Non-admin user modified policy via direct API call bypassing RoleGuard.",  tenant:"Banana Republic",  accountId:"banana_republic", source:"staff.b@bananarepublic.test",       country:"United Kingdom", countryCode:"GB", ip:"185.86.149.33",  status:"Resolved",      relatedIps:["185.86.149.33"] },
  { id:"SE-010", date:"Jun 25, 2026 · 12:30:00", eventType:"Data Exfiltration Attempt",severity:"High",     description:"Bulk export of 4,200 user records via undocumented API parameter.",      tenant:"Orange Teck",      accountId:"orange_teck",     source:"dev.a@orangeteck.test",             country:"India",          countryCode:"IN", ip:"49.36.191.82",   status:"Investigating", relatedIps:["49.36.191.82"] },
  { id:"SE-011", date:"Jun 25, 2026 · 12:15:39", eventType:"Failed Login",             severity:"Low",      description:"3 failed login attempts before successful authentication.",               tenant:"Banana Republic",  accountId:"banana_republic", source:"finance.a@bananarepublic.test",     country:"Canada",         countryCode:"CA", ip:"142.201.31.5",   status:"Dismissed",     relatedIps:["142.201.31.5"] },
  { id:"SE-012", date:"Jun 25, 2026 · 12:00:15", eventType:"Suspicious IP",            severity:"Medium",   description:"IP flagged in threat intelligence database; login blocked.",              tenant:"All Tenants",      accountId:"platform",        source:"admin@nutratenant.test",            country:"Russia",         countryCode:"RU", ip:"45.142.212.100", status:"Resolved",      relatedIps:["45.142.212.100","45.142.212.101"] },
  { id:"SE-013", date:"Jun 25, 2026 · 11:48:02", eventType:"Config Tampering",         severity:"Critical", description:"Direct DB-level modification of role_permissions detected via audit hook.", tenant:"Apple Corp",       accountId:"apple_corp",      source:"SYSTEM",                            country:"United States",  countryCode:"US", ip:"10.0.0.1",       status:"Investigating", relatedIps:["10.0.0.1"] },
  { id:"SE-014", date:"Jun 25, 2026 · 11:35:20", eventType:"MFA Bypass Attempt",       severity:"High",     description:"Repeated TOTP code reuse detected; code valid window exceeded.",          tenant:"Orange Teck",      accountId:"orange_teck",     source:"admin@orangeteck.test",             country:"Japan",          countryCode:"JP", ip:"172.16.0.1",     status:"Resolved",      relatedIps:["172.16.0.1"] },
  { id:"SE-015", date:"Jun 25, 2026 · 11:20:04", eventType:"Policy Violation",         severity:"Medium",   description:"Read request to documents resource denied — insufficient clearance.",      tenant:"Banana Republic",  accountId:"banana_republic", source:"staff.c@bananarepublic.test",       country:"Australia",      countryCode:"AU", ip:"203.0.113.6",    status:"Dismissed",     relatedIps:["203.0.113.6"] },
  { id:"SE-016", date:"Jun 25, 2026 · 11:05:29", eventType:"Brute Force Attack",       severity:"Critical", description:"Distributed brute-force across 18 IPs targeting admin accounts.",          tenant:"All Tenants",      accountId:"platform",        source:"AUTOMATED",                         country:"China",          countryCode:"CN", ip:"103.235.46.x",   status:"Active",        relatedIps:["103.235.46.10","103.235.46.11","103.235.46.12","103.235.46.13"] },
  { id:"SE-017", date:"Jun 25, 2026 · 10:58:33", eventType:"Account Lockout",          severity:"Low",      description:"Account locked after 5 failed attempts; standard policy enforcement.",    tenant:"Apple Corp",       accountId:"apple_corp",      source:"bob.smith@applecorp.test",          country:"United States",  countryCode:"US", ip:"192.168.1.44",   status:"Resolved",      relatedIps:["192.168.1.44"] },
  { id:"SE-018", date:"Jun 25, 2026 · 10:45:18", eventType:"Unauthorized Access",      severity:"High",     description:"Attempt to access /admin/policies without platform-admin cookie.",        tenant:"All Tenants",      accountId:"platform",        source:"bob.smith@applecorp.test",          country:"United States",  countryCode:"US", ip:"192.168.1.44",   status:"Resolved",      relatedIps:["192.168.1.44"] },
  { id:"SE-019", date:"Jun 25, 2026 · 10:30:07", eventType:"Session Anomaly",          severity:"Medium",   description:"User session active simultaneously from two different continents.",        tenant:"Orange Teck",      accountId:"orange_teck",     source:"tech.lead@orangeteck.test",         country:"France",         countryCode:"FR", ip:"2.16.80.24",     status:"Investigating", relatedIps:["2.16.80.24","172.16.0.15"] },
  { id:"SE-020", date:"Jun 25, 2026 · 10:15:44", eventType:"Data Exfiltration Attempt",severity:"High",     description:"Attempt to download audit_logs CSV without export permission.",           tenant:"Banana Republic",  accountId:"banana_republic", source:"staff.a@bananarepublic.test",       country:"Brazil",         countryCode:"BR", ip:"177.42.180.55",  status:"Resolved",      relatedIps:["177.42.180.55"] },
  { id:"SE-021", date:"Jun 25, 2026 · 10:05:29", eventType:"Privilege Escalation",     severity:"Critical", description:"Forged JWT with `role: Super Admin` claim submitted from unknown device.", tenant:"All Tenants",      accountId:"platform",        source:"unknown@external.test",             country:"Romania",        countryCode:"RO", ip:"89.33.44.77",    status:"Active",        relatedIps:["89.33.44.77"] },
  { id:"SE-022", date:"Jun 25, 2026 · 09:58:33", eventType:"Rate Limit Exceeded",      severity:"Low",      description:"Tenant API key exceeded 10,000 hourly requests; throttled.",              tenant:"Apple Corp",       accountId:"apple_corp",      source:"api-key:applecorp-prod",            country:"United States",  countryCode:"US", ip:"54.239.28.85",   status:"Dismissed",     relatedIps:["54.239.28.85"] },
  { id:"SE-023", date:"Jun 25, 2026 · 09:40:00", eventType:"Suspicious IP",            severity:"Medium",   description:"Request from Tor exit node; access restricted pending review.",           tenant:"Orange Teck",      accountId:"orange_teck",     source:"anonymous",                         country:"Unknown",        countryCode:"??", ip:"185.220.101.1",  status:"Resolved",      relatedIps:["185.220.101.1"] },
  { id:"SE-024", date:"Jun 25, 2026 · 09:28:35", eventType:"Config Tampering",         severity:"High",     description:"NEXT_PUBLIC_API_BASE_URL overridden via client-side env manipulation.",   tenant:"Apple Corp",       accountId:"apple_corp",      source:"dave.chen@applecorp.test",          country:"United States",  countryCode:"US", ip:"192.168.1.53",   status:"Investigating", relatedIps:["192.168.1.53"] },
  { id:"SE-025", date:"Jun 25, 2026 · 09:10:20", eventType:"Failed Login",             severity:"Info",     description:"Single failed login; user successfully authenticated on retry.",          tenant:"Banana Republic",  accountId:"banana_republic", source:"finance.b@bananarepublic.test",     country:"Australia",      countryCode:"AU", ip:"203.0.113.9",    status:"Dismissed",     relatedIps:["203.0.113.9"] },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: "bg-red-100 text-red-700 ring-1 ring-red-200",
  High:     "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  Medium:   "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Low:      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Info:     "bg-slate-100 text-slate-600",
};

const STATUS_COLORS: Record<EventStatus, string> = {
  New:          "bg-violet-50 text-violet-700",
  Active:       "bg-red-50 text-red-700",
  Investigating:"bg-amber-50 text-amber-700",
  Resolved:     "bg-emerald-50 text-emerald-700",
  Dismissed:    "bg-slate-100 text-slate-500",
};

const COUNTRY_FLAG: Record<string, string> = {
  US:"🇺🇸", RU:"🇷🇺", CN:"🇨🇳", DE:"🇩🇪", GB:"🇬🇧", JP:"🇯🇵", AU:"🇦🇺",
  CA:"🇨🇦", FR:"🇫🇷", IN:"🇮🇳", BR:"🇧🇷", NL:"🇳🇱", RO:"🇷🇴", KP:"🇰🇵", "??":"🌐",
};

const TABS        = ["All", "Critical", "High", "Medium", "Resolved"] as const;
type Tab          = typeof TABS[number];
const STATUSES    = ["All Status", "New", "Active", "Investigating", "Resolved", "Dismissed"];
const SEVERITIES  = ["All Severity", "Critical", "High", "Medium", "Low", "Info"];
const TENANTS     = ["All Tenants", "Apple Corp", "Orange Teck", "Banana Republic"];
const PAGE_SIZE   = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SecurityEventsPage() {
  const [activeTab,      setActiveTab]      = useState<Tab>("All");
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("All Status");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [tenantFilter,   setTenantFilter]   = useState("All Tenants");
  const [page,           setPage]           = useState(1);
  const [selected,       setSelected]       = useState<SecurityEvent | null>(null);

  const filtered = useMemo(() => MOCK_EVENTS.filter((ev) => {
    const matchTab      = activeTab === "All"      ? true
                        : activeTab === "Resolved" ? ev.status === "Resolved"
                        : ev.severity === activeTab;
    const matchSearch   = !search || ev.eventType.toLowerCase().includes(search.toLowerCase()) || ev.source.toLowerCase().includes(search.toLowerCase()) || ev.ip.includes(search);
    const matchStatus   = statusFilter   === "All Status"   || ev.status   === statusFilter;
    const matchSeverity = severityFilter === "All Severity" || ev.severity === severityFilter;
    const matchTenant   = tenantFilter   === "All Tenants"  || ev.tenant   === tenantFilter;
    return matchTab && matchSearch && matchStatus && matchSeverity && matchTenant;
  }), [activeTab, search, statusFilter, severityFilter, tenantFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabCounts: Record<Tab, number> = {
    All:      MOCK_EVENTS.length,
    Critical: MOCK_EVENTS.filter((e) => e.severity === "Critical").length,
    High:     MOCK_EVENTS.filter((e) => e.severity === "High").length,
    Medium:   MOCK_EVENTS.filter((e) => e.severity === "Medium").length,
    Resolved: MOCK_EVENTS.filter((e) => e.status   === "Resolved").length,
  };

  function resetFilters() {
    setSearch(""); setStatusFilter("All Status"); setSeverityFilter("All Severity");
    setTenantFilter("All Tenants"); setPage(1); setSelected(null);
  }

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Security Events. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Security Events"
          subtitle="Search and respond to security-related events and potential threats across your system."
          actions={
            <>
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                <RefreshCw className="h-4 w-4" /> Reset Filters
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                <Download className="h-4 w-4" /> Export
              </button>
            </>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={ShieldAlert}   value="1,348"                                                    label="Total Events"   sub="All time"            bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={AlertTriangle} value={MOCK_EVENTS.filter((e) => e.status === "New").length}     label="Unreviewed"     sub="Needs attention"     bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={Shield}        value={MOCK_EVENTS.filter((e) => e.severity === "Critical").length} label="Critical"    sub="Immediate action"    bg="bg-red-50"     color="text-red-600"     />
          <StatCard icon={AlertTriangle} value={MOCK_EVENTS.filter((e) => e.status === "Active").length}  label="Active Threats" sub="Currently active"    bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Shield}        value={MOCK_EVENTS.filter((e) => e.status === "Resolved").length}label="Resolved"       sub="Closed events"       bg="bg-emerald-50" color="text-emerald-600" />
        </StatGrid>

        <div className="flex gap-6">
          {/* Table card */}
          <div className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="border-b border-slate-100 px-5 pt-4">
              <TabBar
                tabs={TABS.map((t) => ({ label: t, count: tabCounts[t] }))}
                active={activeTab}
                onChange={(l) => { setActiveTab(l as Tab); setPage(1); setSelected(null); }}
                variant="underline"
              />
            </div>

            <div className="border-b border-slate-100 px-5 py-3">
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search event type, IP, user…" className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
                  <Calendar className="h-3.5 w-3.5" /> May 19 – Jun 25, 2026
                </span>
                <select value={statusFilter}   onChange={(e) => { setStatusFilter(e.target.value);   setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {STATUSES.map((s)   => <option key={s}>{s}</option>)}
                </select>
                <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={tenantFilter}   onChange={(e) => { setTenantFilter(e.target.value);   setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TENANTS.map((t)    => <option key={t}>{t}</option>)}
                </select>
                <button type="button" onClick={resetFilters} className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 hover:bg-slate-50">Reset</button>
              </SearchFilterBar>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Date / Time","Event Type","Description","Source","Account","Country","IP Address","Status","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 && (
                    <tr><td colSpan={9} className="px-5 py-10 text-center text-sm text-slate-400">No security events match your filters.</td></tr>
                  )}
                  {paginated.map((ev) => (
                    <tr key={ev.id} onClick={() => setSelected((p) => p?.id === ev.id ? null : ev)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === ev.id ? "bg-green-50" : ""}`}>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0 text-slate-300" />{ev.date}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${SEVERITY_COLORS[ev.severity]}`}>
                          <AlertTriangle className="h-2.5 w-2.5" />{ev.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="truncate text-xs text-slate-700">{ev.description}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="max-w-[140px] truncate block text-xs text-slate-600">{ev.source}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">{ev.accountId}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        <span>{COUNTRY_FLAG[ev.countryCode] ?? "🌐"} {ev.country}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{ev.ip}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={ev.status} colorMap={STATUS_COLORS} /></td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button type="button" className="rounded border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50">Review</button>
                          {ev.status !== "Resolved" && ev.status !== "Dismissed" && (
                            <button type="button" className="rounded border border-emerald-200 px-2 py-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-50">Resolve</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">
                {filtered.length === 0 ? "No results" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} events`}
              </p>
              <div className="flex items-center gap-1">
                <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium ${p === page ? "border-green-600 bg-green-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>
                ))}
                <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <DetailPanel
              title="Event Details"
              badge={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_COLORS[selected.severity]}`}>{selected.severity}</span>}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  {selected.status !== "Resolved" && selected.status !== "Dismissed" && (
                    <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Mark Resolved</button>
                  )}
                  <button type="button" className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Dismiss</button>
                </div>
              }
            >
              <div className="mb-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${SEVERITY_COLORS[selected.severity]}`}>
                  <AlertTriangle className="h-2.5 w-2.5" />{selected.eventType}
                </span>
              </div>
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Hash}     label="Event ID"    value={<span className="font-mono text-xs">{selected.id}</span>}       />
              <DetailRow icon={Clock}    label="Date"        value={selected.date}                                                   />
              <DetailRow icon={User}     label="Source"      value={<span className="truncate text-xs">{selected.source}</span>}    />
              <DetailRow icon={Globe}    label="Country"     value={`${COUNTRY_FLAG[selected.countryCode] ?? "🌐"} ${selected.country}`} />
              <DetailRow icon={Globe}    label="Account ID"  value={selected.accountId}                                             />
              <DetailRow icon={Shield}   label="IP Address"  value={<span className="font-mono text-xs">{selected.ip}</span>}       />
              <StatusBadge status={selected.status} colorMap={STATUS_COLORS} />

              {selected.relatedIps.length > 1 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Related IPs ({selected.relatedIps.length})</p>
                  <div className="flex flex-col gap-1">
                    {selected.relatedIps.map((ip) => (
                      <div key={ip} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                        <span className="font-mono text-[11px] text-slate-700">{ip}</span>
                        <button type="button" className="rounded border border-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50">Block</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DetailPanel>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

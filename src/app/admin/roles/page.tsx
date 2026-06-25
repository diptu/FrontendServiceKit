"use client";

import { useState } from "react";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  AdminTable,
  DetailPanel,
  DetailRow,
  PageHeader,
  PreviewBanner,
  SearchFilterBar,
  StatCard,
  StatGrid,
  StatusBadge,
} from "@/components/platform-admin/ui";
import { Building2, Calendar, Edit2, KeyRound, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";

type RoleType = "System" | "Custom";

interface Role {
  id: string; name: string; type: RoleType; tenant: string; users: number;
  permissions: number; description: string; status: "Active" | "Inactive";
  createdAt: string; scopes: string[];
}

const MOCK_ROLES: Role[] = [
  { id:"r1",  name:"Super Admin",          type:"System", tenant:"All Tenants",      users:1,  permissions:214, status:"Active",   createdAt:"Jan 1, 2024",   description:"Full platform-wide access to all resources, tenants, and configurations.",                   scopes:["users:*","policies:*","audit_logs:*","documents:*","tenants:*"] },
  { id:"r2",  name:"Tenant Admin",         type:"System", tenant:"All Tenants",      users:3,  permissions:156, status:"Active",   createdAt:"Jan 1, 2024",   description:"Full administrative control within an assigned tenant.",                                      scopes:["users:read","users:write","policies:read","policies:write","documents:*"] },
  { id:"r3",  name:"Moderator",            type:"System", tenant:"All Tenants",      users:7,  permissions:48,  status:"Active",   createdAt:"Jan 1, 2024",   description:"Moderate content, manage user sessions, review flagged items.",                              scopes:["users:read","documents:read","documents:write","session:login"] },
  { id:"r4",  name:"Finance Owner",        type:"System", tenant:"All Tenants",      users:3,  permissions:42,  status:"Active",   createdAt:"Jan 1, 2024",   description:"Manage billing, invoices, and financial reports across tenants.",                            scopes:["documents:read","documents:write","users:read"] },
  { id:"r5",  name:"Support Agent",        type:"System", tenant:"All Tenants",      users:5,  permissions:28,  status:"Active",   createdAt:"Jan 1, 2024",   description:"Handle support tickets and access read-only user/tenant information.",                       scopes:["users:read","documents:read","session:login"] },
  { id:"r6",  name:"User",                 type:"System", tenant:"All Tenants",      users:24, permissions:8,   status:"Active",   createdAt:"Jan 1, 2024",   description:"Base-level authenticated user with access to personal workspace only.",                      scopes:["documents:read","session:login"] },
  { id:"r7",  name:"Executive Ops Lead",   type:"Custom", tenant:"Apple Corp",       users:2,  permissions:62,  status:"Active",   createdAt:"Mar 5, 2024",   description:"Senior leadership with elevated read access across Apple Corp operations.",                  scopes:["users:read","policies:read","documents:*","audit_logs:read"] },
  { id:"r8",  name:"IT Security Officer",  type:"Custom", tenant:"Apple Corp",       users:1,  permissions:88,  status:"Active",   createdAt:"Mar 5, 2024",   description:"Manage security policies, ABAC configurations, and IAM audit trails.",                      scopes:["policies:*","audit_logs:*","users:read"] },
  { id:"r9",  name:"HR Manager",           type:"Custom", tenant:"Apple Corp",       users:2,  permissions:34,  status:"Active",   createdAt:"Apr 1, 2024",   description:"Access HR documents and user onboarding flows within Apple Corp.",                          scopes:["users:read","users:write","documents:read","documents:write"] },
  { id:"r10", name:"Product Lead",         type:"Custom", tenant:"Apple Corp",       users:1,  permissions:24,  status:"Active",   createdAt:"Apr 1, 2024",   description:"View product documents, analytics, and roadmap resources.",                                  scopes:["documents:read","documents:write"] },
  { id:"r11", name:"Data Analyst",         type:"Custom", tenant:"Apple Corp",       users:3,  permissions:18,  status:"Active",   createdAt:"May 10, 2024",  description:"Read-only access to analytics exports and report documents.",                               scopes:["documents:read"] },
  { id:"r12", name:"Sales Lead",           type:"Custom", tenant:"Apple Corp",       users:2,  permissions:16,  status:"Active",   createdAt:"May 10, 2024",  description:"Manage sales materials and client-facing documents.",                                         scopes:["documents:read","documents:write"] },
  { id:"r13", name:"Operations Manager",   type:"Custom", tenant:"Orange Teck",      users:2,  permissions:44,  status:"Active",   createdAt:"May 1, 2024",   description:"Oversee daily operations and logistics across Orange Teck.",                                 scopes:["users:read","documents:*"] },
  { id:"r14", name:"Tech Lead",            type:"Custom", tenant:"Orange Teck",      users:1,  permissions:52,  status:"Active",   createdAt:"May 1, 2024",   description:"Lead technical initiatives, review security policies, manage dev resources.",               scopes:["policies:read","documents:*","audit_logs:read"] },
  { id:"r15", name:"Junior Developer",     type:"Custom", tenant:"Orange Teck",      users:3,  permissions:12,  status:"Active",   createdAt:"Jun 1, 2024",   description:"Read/write access to development documents and shared workspaces.",                          scopes:["documents:read","documents:write","session:login"] },
  { id:"r16", name:"Regional Manager",     type:"Custom", tenant:"Banana Republic",  users:2,  permissions:38,  status:"Active",   createdAt:"Jul 10, 2024",  description:"Manage users and resources within assigned regional scope.",                                  scopes:["users:read","users:write","documents:read"] },
  { id:"r17", name:"Finance Analyst",      type:"Custom", tenant:"Banana Republic",  users:2,  permissions:22,  status:"Active",   createdAt:"Jul 10, 2024",  description:"Review financial reports and access billing-related documents.",                             scopes:["documents:read"] },
  { id:"r18", name:"Content Coordinator",  type:"Custom", tenant:"Banana Republic",  users:1,  permissions:14,  status:"Inactive", createdAt:"Aug 20, 2024",  description:"Manage content publishing workflows. Currently inactive.",                                   scopes:["documents:read","documents:write"] },
];

const TYPE_BADGE: Record<RoleType, string> = { System:"bg-violet-50 text-violet-700", Custom:"bg-blue-50 text-blue-700" };
const STATUS_COLORS: Record<string, string> = { Active:"bg-emerald-50 text-emerald-700", Inactive:"bg-gray-100 text-gray-500" };
const TENANTS = ["All Tenants", "Apple Corp", "Orange Teck", "Banana Republic"];

export default function RolesPage() {
  const [selected,    setSelected]    = useState<Role | null>(null);
  const [search,      setSearch]      = useState("");
  const [tenantFilter,setTenantFilter]= useState("All Tenants");
  const [typeFilter,  setTypeFilter]  = useState("All");

  const filtered = MOCK_ROLES.filter((r) => {
    const ms  = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const mt  = tenantFilter === "All Tenants" || r.tenant === tenantFilter;
    const mty = typeFilter === "All" || r.type === typeFilter;
    return ms && mt && mty;
  });

  const systemCount = MOCK_ROLES.filter((r) => r.type === "System").length;
  const customCount = MOCK_ROLES.filter((r) => r.type === "Custom").length;
  const totalUsers  = MOCK_ROLES.reduce((s, r) => s + r.users, 0);

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Roles management. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Roles"
          subtitle="Define and manage all roles across system and tenant namespaces."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Create Role
            </button>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={ShieldCheck} value={MOCK_ROLES.length} label="Total Roles"      sub="System + custom"       bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={ShieldCheck} value={systemCount}        label="System Roles"     sub="Platform-defined"      bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={KeyRound}    value={customCount}         label="Custom Roles"     sub="Tenant-defined"        bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Users}       value={totalUsers}          label="Users Assigned"   sub="Across all roles"      bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Building2}   value={3}                   label="Tenants"          sub="With custom roles"     bg="bg-slate-100"  color="text-slate-600"   />
        </StatGrid>

        <div className="flex gap-6">
          <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <p className="text-sm font-semibold text-slate-900">All Roles</p>
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TENANTS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {["All","System","Custom"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </SearchFilterBar>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Role Name","Type","Tenant","Users","Permissions","Created At","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((role) => (
                    <tr key={role.id} onClick={() => setSelected(selected?.id === role.id ? null : role)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === role.id ? "bg-green-50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${role.type === "System" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>{role.name.charAt(0)}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{role.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">{role.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[role.type]}`}>{role.type}</span></td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{role.tenant}</td>
                      <td className="px-5 py-3.5 text-slate-700">{role.users}</td>
                      <td className="px-5 py-3.5 text-slate-700">{role.permissions}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{role.createdAt}</td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button type="button" className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"><Edit2 className="h-3.5 w-3.5" /></button>
                          {role.type === "Custom" && <button type="button" className="rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_ROLES.length} roles</p>
            </div>
          </div>

          {selected && (
            <DetailPanel
              title={selected.name}
              badge={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[selected.type]}`}>{selected.type}</span>}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Edit Role</button>
                  <button type="button" className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Assign Users</button>
                </div>
              }
            >
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Building2}   label="Tenant"      value={selected.tenant}                              />
              <DetailRow icon={Users}       label="Users"       value={`${selected.users} assigned`}                />
              <DetailRow icon={KeyRound}    label="Permissions" value={`${selected.permissions} permissions`}       />
              <DetailRow icon={Calendar}    label="Created At"  value={selected.createdAt}                          />
              <StatusBadge status={selected.status} colorMap={STATUS_COLORS} />
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scopes</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.scopes.map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
            </DetailPanel>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

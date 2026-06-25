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
import { Building2, Calendar, Database, Edit2, Plus, Search, Trash2, Users } from "lucide-react";

type GroupType = "System" | "Tenant" | "IAM";

interface GroupMember { email: string; role: string }

interface Group {
  id: string; name: string; type: GroupType; tenant: string;
  members: GroupMember[]; status: "Active" | "Inactive";
  description: string; createdAt: string; createdBy: string;
}

const MOCK_GROUPS: Group[] = [
  {
    id:"g1", name:"Super Admins", type:"System", tenant:"All Tenants", status:"Active", createdAt:"Jan 1, 2024", createdBy:"System",
    description:"All platform-level super administrators with unrestricted access.",
    members:[{ email:"admin@nutratenant.test", role:"Super Admin" }],
  },
  {
    id:"g2", name:"Finance Owners", type:"System", tenant:"All Tenants", status:"Active", createdAt:"Jan 1, 2024", createdBy:"System",
    description:"Finance leaders from all tenants.",
    members:[{ email:"alice.johnson@applecorp.test", role:"Finance Owner" }, { email:"carol.jones@applecorp.test", role:"Finance Owner" }],
  },
  {
    id:"g3", name:"Tenant Admins", type:"System", tenant:"All Tenants", status:"Active", createdAt:"Jan 1, 2024", createdBy:"System",
    description:"Primary tenant administrators responsible for IAM within their tenant.",
    members:[{ email:"admin@applecorp.test", role:"Admin" }, { email:"admin@orangeteck.test", role:"Admin" }, { email:"admin@bananarepublic.test", role:"Admin" }],
  },
  {
    id:"g4", name:"Apple Corp — Executive Team", type:"Tenant", tenant:"Apple Corp", status:"Active", createdAt:"Mar 5, 2024", createdBy:"admin@applecorp.test",
    description:"Executive leadership with elevated cross-department visibility.",
    members:[{ email:"alice.johnson@applecorp.test", role:"Admin" }, { email:"bob.smith@applecorp.test", role:"Moderator" }],
  },
  {
    id:"g5", name:"Apple Corp — Engineering", type:"Tenant", tenant:"Apple Corp", status:"Active", createdAt:"May 1, 2024", createdBy:"admin@applecorp.test",
    description:"Engineering team members with document and code resource access.",
    members:[{ email:"dave.chen@applecorp.test", role:"Member" }, { email:"alice.johnson@applecorp.test", role:"Admin" }],
  },
  {
    id:"g6", name:"Orange Teck — Operations", type:"Tenant", tenant:"Orange Teck", status:"Active", createdAt:"Apr 12, 2024", createdBy:"admin@orangeteck.test",
    description:"Operations and logistics team for Orange Teck.",
    members:[{ email:"ops.lead@orangeteck.test", role:"Member" }, { email:"admin@orangeteck.test", role:"Admin" }],
  },
  {
    id:"g7", name:"Orange Teck — Tech Division", type:"Tenant", tenant:"Orange Teck", status:"Active", createdAt:"Apr 12, 2024", createdBy:"admin@orangeteck.test",
    description:"Technical engineering and DevOps staff.",
    members:[{ email:"tech.lead@orangeteck.test", role:"Moderator" }, { email:"dev.a@orangeteck.test", role:"Member" }, { email:"dev.b@orangeteck.test", role:"Member" }],
  },
  {
    id:"g8", name:"Banana Republic — Staff", type:"Tenant", tenant:"Banana Republic", status:"Active", createdAt:"Jul 10, 2024", createdBy:"admin@bananarepublic.test",
    description:"General staff members across all Banana Republic departments.",
    members:[{ email:"staff.a@bananarepublic.test", role:"User" }, { email:"staff.b@bananarepublic.test", role:"User" }, { email:"staff.c@bananarepublic.test", role:"Member" }],
  },
  {
    id:"g9", name:"Banana Republic — Finance", type:"Tenant", tenant:"Banana Republic", status:"Active", createdAt:"Jul 15, 2024", createdBy:"admin@bananarepublic.test",
    description:"Finance team with clearance-gated document access.",
    members:[{ email:"finance.a@bananarepublic.test", role:"Finance Owner" }, { email:"finance.b@bananarepublic.test", role:"Member" }],
  },
  {
    id:"g10", name:"Platform IAM Admins", type:"IAM", tenant:"All Tenants", status:"Active", createdAt:"Jan 1, 2024", createdBy:"System",
    description:"Cross-tenant IAM administrators with policy management capabilities.",
    members:[{ email:"iam.a@nutratenant.test", role:"Super Admin" }, { email:"iam.b@nutratenant.test", role:"Tenant Admin" }],
  },
];

const TYPE_BADGE: Record<GroupType, string> = { System:"bg-violet-50 text-violet-700", Tenant:"bg-blue-50 text-blue-700", IAM:"bg-emerald-50 text-emerald-700" };
const STATUS_COLORS: Record<string, string>  = { Active:"bg-emerald-50 text-emerald-700", Inactive:"bg-gray-100 text-gray-500" };
const ROLE_BADGE: Record<string, string>     = { "Super Admin":"bg-violet-50 text-violet-700", Admin:"bg-indigo-50 text-indigo-700", Moderator:"bg-blue-50 text-blue-700", "Finance Owner":"bg-amber-50 text-amber-700", Member:"bg-emerald-50 text-emerald-700", User:"bg-gray-100 text-gray-600", "Tenant Admin":"bg-cyan-50 text-cyan-700" };
const TENANTS                               = ["All Tenants","Apple Corp","Orange Teck","Banana Republic"];

export default function GroupsPage() {
  const [selected,     setSelected]     = useState<Group | null>(null);
  const [search,       setSearch]       = useState("");
  const [tenantFilter, setTenantFilter] = useState("All Tenants");
  const [typeFilter,   setTypeFilter]   = useState("All");

  const filtered = MOCK_GROUPS.filter((g) => {
    const ms  = !search || g.name.toLowerCase().includes(search.toLowerCase());
    const mt  = tenantFilter === "All Tenants" || g.tenant === tenantFilter;
    const mty = typeFilter === "All" || g.type === typeFilter;
    return ms && mt && mty;
  });

  const systemCount  = MOCK_GROUPS.filter((g) => g.type === "System").length;
  const tenantCount  = MOCK_GROUPS.filter((g) => g.type === "Tenant").length;
  const iamCount     = MOCK_GROUPS.filter((g) => g.type === "IAM").length;
  const totalMembers = MOCK_GROUPS.reduce((s, g) => s + g.members.length, 0);

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Groups management. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Groups"
          subtitle="Manage user groups for access control scoping across tenants."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Create Group
            </button>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={Database}   value={MOCK_GROUPS.length} label="All Groups"       sub="System + tenant + IAM" bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={Database}   value={systemCount}        label="System Groups"    sub="Platform-defined"      bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={Building2}  value={tenantCount}        label="Tenant Groups"    sub="Tenant-scoped"         bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Users}      value={totalMembers}       label="Users in Groups"  sub="Total memberships"     bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Database}   value={iamCount}           label="IAM Groups"       sub="Cross-tenant IAM"      bg="bg-slate-100"  color="text-slate-600"   />
        </StatGrid>

        <div className="flex gap-6">
          <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <p className="text-sm font-semibold text-slate-900">All Groups</p>
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TENANTS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {["All","System","Tenant","IAM"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </SearchFilterBar>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Group Name","Type","Tenant","Members","Status","Created At","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((group) => (
                    <tr key={group.id} onClick={() => setSelected(selected?.id === group.id ? null : group)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === group.id ? "bg-green-50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">{group.name.charAt(0)}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{group.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">{group.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[group.type]}`}>{group.type}</span></td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{group.tenant}</td>
                      <td className="px-5 py-3.5 text-slate-700">{group.members.length}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={group.status} colorMap={STATUS_COLORS} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{group.createdAt}</td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button type="button" className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"><Edit2 className="h-3.5 w-3.5" /></button>
                          {group.type !== "System" && <button type="button" className="rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_GROUPS.length} groups</p>
            </div>
          </div>

          {selected && (
            <DetailPanel
              title={selected.name}
              badge={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[selected.type]}`}>{selected.type}</span>}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Edit Group</button>
                  <button type="button" className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Add Member</button>
                </div>
              }
            >
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Building2} label="Tenant"     value={selected.tenant}                          />
              <DetailRow icon={Calendar}  label="Created"    value={selected.createdAt}                       />
              <DetailRow icon={Users}     label="Created By" value={selected.createdBy}                       />
              <StatusBadge status={selected.status} colorMap={STATUS_COLORS} />
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Members ({selected.members.length})</p>
                <div className="flex flex-col gap-2">
                  {selected.members.map((m) => (
                    <div key={m.email} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">{m.email.charAt(0).toUpperCase()}</div>
                        <p className="text-[11px] text-slate-600 truncate max-w-[120px]">{m.email}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[m.role] ?? "bg-gray-100 text-gray-600"}`}>{m.role}</span>
                    </div>
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

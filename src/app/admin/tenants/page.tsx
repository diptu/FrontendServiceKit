import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  AdminTable,
  PageHeader,
  PreviewBanner,
  SearchFilterBar,
  StatCard,
  StatGrid,
  StatusBadge,
} from "@/components/platform-admin/ui";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";
import mockData from "@/mock/data.json";
import Link from "next/link";
import { Building2, CreditCard, Download, Eye, FileText, Plus, TrendingUp, Users } from "lucide-react";

const AUTH_GATE_DISABLED = true;

const PLAN_META: Record<string, { badge: string; label: string; price: number }> = {
  enterprise: { badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200", label: "Enterprise", price: 2399 },
  growth:     { badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",       label: "Growth",     price: 499  },
  starter:    { badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",      label: "Starter",    price: 72   },
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700",
  inactive: "bg-red-50 text-red-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminTenantsPage() {
  const session = (await getPlatformAdminSession()) ?? (AUTH_GATE_DISABLED ? { id: "preview" } : null);
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Access denied.</p>
      </div>
    );
  }

  const tenants = Object.values(mockData.tenants).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const totalUsers = mockData.users.length;
  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const mrr = tenants.reduce((sum, t) => sum + (PLAN_META[t.plan]?.price ?? 0), 0);

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId={session.id}>
      <div className="flex flex-col gap-6">
        <PreviewBanner>Preview mode — auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Tenants"
          subtitle="Manage and monitor all tenant organisations in the system."
          actions={
            <>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                <Download className="h-4 w-4" /> Export
              </button>
              <Link href="/admin/tenants/create" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                <Plus className="h-4 w-4" /> Create New Tenant
              </Link>
            </>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={Building2}  value={tenants.length}              label="Total Tenants"    sub={`Active: ${activeTenants}`}  bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={Users}      value={totalUsers}                   label="Total Users"      sub="Across all tenants"          bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={CreditCard} value={tenants.length}               label="Subscriptions"    sub="Paid subscriptions"          bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={TrendingUp} value={`$${mrr.toLocaleString()}`}   label="Monthly Revenue"  sub="Monthly recurring"           bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={FileText}   value={0}                            label="Outstanding Inv." sub="Unpaid invoices"             bg="bg-red-50"     color="text-red-600"     />
        </StatGrid>

        <SearchFilterBar placeholder="Search by name, slug, or domain…">
          {["Status: All", "Plan: All", "Industry: All"].map((f) => (
            <select key={f} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>{f}</option>
            </select>
          ))}
          <button type="button" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 hover:bg-slate-50">
            More Filters
          </button>
        </SearchFilterBar>

        <AdminTable
          footer={
            <>
              <p className="text-xs text-slate-400">Showing {tenants.length} of {tenants.length} tenants</p>
              <p className="text-xs text-slate-400">10 per page</p>
            </>
          }
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Tenant", "Slug", "Plan", "Users", "Status", "Created At", "Subscription", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => {
                const meta = PLAN_META[tenant.plan] ?? { badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200", label: tenant.plan, price: 0 };
                const userCount = mockData.users.filter((u) => u.tenant_id === tenant.tenant_id).length;
                return (
                  <tr key={tenant.tenant_id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">{tenant.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-slate-900">{tenant.name}</p>
                          <p className="text-xs text-slate-400">{tenant.subdomain}.nutratenant.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{tenant.subdomain}</td>
                    <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>{meta.label}</span></td>
                    <td className="px-6 py-4 text-slate-700">{userCount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)} colorMap={{ Active: STATUS_COLORS.active, Inactive: STATUS_COLORS.inactive }} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(tenant.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">${meta.price.toLocaleString()}/mo</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/tenants/${tenant.tenant_id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTable>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

import RecentActivityFeed from "@/components/platform-admin/RecentActivityFeed";
import KpiStatGrid from "@/components/platform-admin/KpiStatGrid";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import TenantManagementTable, { type TenantOverviewRow } from "@/components/platform-admin/TenantManagementTable";
import UserOverviewChart from "@/components/platform-admin/UserOverviewChart";
import UsersByRoleChart, { type RoleBreakdownEntry } from "@/components/platform-admin/UsersByRoleChart";
import { AdminFooter, PageHeader, PreviewBanner } from "@/components/platform-admin/ui";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";
import mockData from "@/mock/data.json";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// TODO(auth): temporary -- the SUPER_ADMIN/SYSTEM_ADMIN gate below is
// disabled so anyone can view this dashboard for now. Restore it by
// deleting this fallback and the `?? { id: "anonymous" }` below, so a
// missing/invalid session goes back to rendering the denial screen instead
// of a placeholder identity. Do not ship this state to a real deployment.
const AUTH_GATE_DISABLED = true;

export default async function PlatformAdminDashboardPage() {
  const session = (await getPlatformAdminSession()) ?? (AUTH_GATE_DISABLED ? { id: "anonymous" } : null);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">
          Access denied. A valid SUPER_ADMIN / SYSTEM_ADMIN session is required.
        </p>
      </div>
    );
  }

  const tenants = Object.values(mockData.tenants).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const totalUsers = mockData.users.length;

  const tenantRows: TenantOverviewRow[] = tenants.map((tenant) => ({
    id: tenant.tenant_id,
    name: tenant.name,
    plan: tenant.plan,
    status: tenant.status,
    userCount: mockData.users.filter((user) => user.tenant_id === tenant.tenant_id).length,
    createdAt: formatDate(tenant.created_at),
  }));

  const roleCounts = mockData.users.reduce<Record<string, number>>((counts, user) => {
    counts[user.role] = (counts[user.role] ?? 0) + 1;
    return counts;
  }, {});

  const roleBreakdown: RoleBreakdownEntry[] = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId={session.id}>
      <div className="flex flex-col gap-6">
        <PreviewBanner>
          Preview mode: the SUPER_ADMIN session check is temporarily disabled, so this dashboard is viewable without
          signing in. Re-enable the gate in app/admin/dashboard/page.tsx before any real deployment.
        </PreviewBanner>

        <PageHeader
          title="Welcome back, Super Admin 👋"
          subtitle="Here's what's happening across your NutraTenant platform."
        />

        <KpiStatGrid totalTenants={tenants.length} totalUsers={totalUsers} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UserOverviewChart />
          </div>
          <div className="lg:col-span-1">
            <UsersByRoleChart breakdown={roleBreakdown} total={totalUsers} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TenantManagementTable tenants={tenantRows} />
          </div>
          <div className="lg:col-span-1">
            <RecentActivityFeed />
          </div>
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

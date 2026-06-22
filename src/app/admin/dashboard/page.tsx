import RecentActivityFeed from "@/components/platform-admin/RecentActivityFeed";
import KpiStatGrid from "@/components/platform-admin/KpiStatGrid";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import TenantManagementTable, { type TenantOverviewRow } from "@/components/platform-admin/TenantManagementTable";
import UserOverviewChart from "@/components/platform-admin/UserOverviewChart";
import UsersByRoleChart, { type RoleBreakdownEntry } from "@/components/platform-admin/UsersByRoleChart";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";
import { prisma } from "@/lib/db/prismaClient";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * NutraTenant Central Platform console -- top-level (not tenant-scoped),
 * same reasoning as app/admin/onboard/page.tsx: this is a cross-tenant
 * System Admin/Superuser tool, so it can't live under app/[tenant]/...,
 * and middleware.ts only rewrites/guards tenant-subdomain hosts -- on the
 * bare root domain it passes every path through untouched. This page does
 * its own server-side check against the access_token cookie instead of
 * relying on SecurityGuard/RoleGuard, which are wired into the
 * [tenant]/(dashboard) tree only and check a completely different claims
 * shape (JWTClaims, not PlatformAdminClaims).
 *
 * Tenant/user counts and the role breakdown are real Prisma queries
 * (intentionally cross-tenant -- no tenantScopedQuery here, this console's
 * whole purpose is to see across tenants). "Active Roles" and "Policy
 * Decisions" on the KPI grid, and the 30-day trend / recent-activity feed,
 * stay decorative -- see their components for why.
 */
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

  const [tenants, totalUsers, roleGroups] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { users: true } } },
    }),
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
  ]);

  const tenantRows: TenantOverviewRow[] = tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    plan: tenant.plan,
    status: tenant.status,
    userCount: tenant._count.users,
    createdAt: formatDate(tenant.createdAt),
  }));

  const roleBreakdown: RoleBreakdownEntry[] = roleGroups.map((group) => ({
    role: group.role,
    count: group._count.role,
  }));

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId={session.id}>
      <div className="flex flex-col gap-6">
        {AUTH_GATE_DISABLED && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
            Preview mode: the SUPER_ADMIN session check is temporarily disabled, so this dashboard is viewable without
            signing in. Re-enable the gate in app/admin/dashboard/page.tsx before any real deployment.
          </div>
        )}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back, Super Admin 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening across your NutraTenant platform.</p>
        </div>

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

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row">
          <span>© 2026 NutraTenant. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">
              Support
            </a>
            <a href="#" className="hover:text-slate-600">
              Status
            </a>
            <a href="#" className="hover:text-slate-600">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-600">
              Terms
            </a>
          </div>
        </footer>
      </div>
    </PlatformAdminShell>
  );
}

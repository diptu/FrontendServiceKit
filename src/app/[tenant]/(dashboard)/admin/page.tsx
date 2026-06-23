import AdminOperationsHub, { type DirectoryUser, type TenantMetadata } from "@/components/admin/AdminOperationsHub";
import { getServerSession } from "@/core/auth/getServerSession";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import mockData from "@/mock/data.json";

/**
 * Data comes from the static seed dataset (src/mock/data.json) -- there's
 * no database behind this frontend (removed: doesn't survive Vercel's
 * serverless filesystem) and no real backend endpoint for tenant user
 * directories yet (only /auth/login exists on the live gateway so far).
 */
export default async function AdminWorkspacePage() {
  const claims = await getServerSession();

  if (!claims) {
    // RoleGuard (admin/layout.tsx) and middleware.ts already gate this
    // route -- this is a defensive fallback, not the primary auth check.
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const tenantRecordId = resolvePrismaTenantId(claims.tenant_org);
  const tenant = mockData.tenants[tenantRecordId as keyof typeof mockData.tenants];

  if (!tenant) {
    return <p className="text-sm text-slate-500">Tenant metadata could not be loaded.</p>;
  }

  const users = mockData.users.filter((user) => user.tenant_id === tenantRecordId);

  const tenantMetadata: TenantMetadata = {
    tenantId: tenant.tenant_id,
    name: tenant.name,
    plan: tenant.plan,
    status: tenant.status,
    memberSeatsUsed: users.length,
    memberSeatsLimit: tenant.settings.max_users ?? users.length,
  };

  const directoryUsers: DirectoryUser[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role as DirectoryUser["role"],
    department: user.department,
    clearance: user.clearance,
    mfaVerified: user.mfa_verified,
    accountLocked: user.account_locked,
  }));

  return <AdminOperationsHub tenant={tenantMetadata} users={directoryUsers} />;
}

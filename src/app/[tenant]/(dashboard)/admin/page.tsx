import type { Prisma, User as PrismaUser } from "@prisma/client";
import AdminOperationsHub, { type DirectoryUser, type TenantMetadata } from "@/components/admin/AdminOperationsHub";
import { getServerSession } from "@/core/auth/getServerSession";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import { prisma } from "@/lib/db/prismaClient";
import { tenantScopedQuery, type ValidatedSession } from "@/lib/db/tenantScopedQuery";

interface TenantSettings {
  max_users?: number;
}

export default async function AdminWorkspacePage() {
  const claims = await getServerSession();

  if (!claims) {
    // RoleGuard (admin/layout.tsx) and middleware.ts already gate this
    // route -- this is a defensive fallback, not the primary auth check.
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const session: ValidatedSession = {
    userId: claims.sub,
    tenantId: resolvePrismaTenantId(claims.tenant_org),
    role: mapClaimRoleToPolicyRole(claims.role),
  };

  const [tenant, users] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: session.tenantId } }),
    tenantScopedQuery<Prisma.UserFindManyArgs, PrismaUser[]>(session, {
      resource: "users",
      run: (args) => prisma.user.findMany(args),
      args: { orderBy: { email: "asc" } },
    }),
  ]);

  if (!tenant) {
    return <p className="text-sm text-slate-500">Tenant metadata could not be loaded.</p>;
  }

  const settings = tenant.settings as TenantSettings;

  const tenantMetadata: TenantMetadata = {
    tenantId: tenant.id,
    name: tenant.name,
    plan: tenant.plan,
    status: tenant.status,
    memberSeatsUsed: users.length,
    memberSeatsLimit: settings.max_users ?? users.length,
  };

  const directoryUsers: DirectoryUser[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role as DirectoryUser["role"],
    department: user.department,
    clearance: user.clearance,
    mfaVerified: user.mfaVerified,
    accountLocked: user.accountLocked,
  }));

  return <AdminOperationsHub tenant={tenantMetadata} users={directoryUsers} />;
}

import type { AuditLog as PrismaAuditLog, Prisma } from "@prisma/client";
import AuditLogStream, { type AuditLogEntry } from "@/components/audit/AuditLogStream";
import { getServerSession } from "@/core/auth/getServerSession";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import { prisma } from "@/lib/db/prismaClient";
import { tenantScopedQuery, type ValidatedSession } from "@/lib/db/tenantScopedQuery";

export default async function AuditLogsPage() {
  const claims = await getServerSession();

  if (!claims) {
    // middleware.ts (PEP) already requires Admin-tier clearance for the
    // "audit_logs" resource on this path -- this is a defensive fallback.
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const session: ValidatedSession = {
    userId: claims.sub,
    tenantId: resolvePrismaTenantId(claims.tenant_org),
    role: mapClaimRoleToPolicyRole(claims.role),
  };

  const logs = await tenantScopedQuery<Prisma.AuditLogFindManyArgs, PrismaAuditLog[]>(session, {
    resource: "audit_logs",
    run: (args) => prisma.auditLog.findMany(args),
    args: { orderBy: { timestamp: "desc" } },
  });

  const entries: AuditLogEntry[] = logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    actorEmail: log.subjectEmail,
    action: log.action,
    resource: log.resource,
    outcome: log.outcome as AuditLogEntry["outcome"],
    ipAddress: log.ipAddress,
  }));

  return <AuditLogStream logs={entries} />;
}

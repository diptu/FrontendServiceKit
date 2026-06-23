import AuditLogStream, { type AuditLogEntry } from "@/components/audit/AuditLogStream";
import { getServerSession } from "@/core/auth/getServerSession";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import mockData from "@/mock/data.json";

/**
 * Logs come from the static seed dataset (src/mock/data.json) -- there's
 * no database behind this frontend (removed: doesn't survive Vercel's
 * serverless filesystem) and no real backend audit-log endpoint yet (only
 * /auth/login exists on the live gateway so far).
 */
export default async function AuditLogsPage() {
  const claims = await getServerSession();

  if (!claims) {
    // middleware.ts (PEP) already requires Admin-tier clearance for the
    // "audit_logs" resource on this path -- this is a defensive fallback.
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const tenantRecordId = resolvePrismaTenantId(claims.tenant_org);

  const entries: AuditLogEntry[] = mockData.auditLogs
    .filter((log) => log.tenant_id === tenantRecordId)
    .map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      actorEmail: log.subject_email,
      action: log.action,
      resource: log.resource,
      outcome: log.outcome as AuditLogEntry["outcome"],
      ipAddress: log.ip_address,
    }));

  return <AuditLogStream logs={entries} />;
}

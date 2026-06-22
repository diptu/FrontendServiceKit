import { randomUUID } from "node:crypto";
import { prisma } from "./prismaClient";

/**
 * The minimum a Server Component needs to have already validated before
 * calling tenantScopedQuery -- see core/auth/getServerSession.ts for how
 * this gets built from the access-token cookie.
 */
export interface ValidatedSession {
  userId: string;
  tenantId: string;
  role: string;
}

export interface TenantScopedQueryConfig<TArgs extends { where?: Record<string, unknown> }, TResult> {
  /** Resource name for audit logging, e.g. "documents", "users". */
  resource: string;
  /** The Prisma operation to run, e.g. `(args) => prisma.document.findMany(args)`. */
  run: (scopedArgs: TArgs) => Promise<TResult>;
  /** The query's Prisma args (where/orderBy/include/etc.) -- `args.where.tenantId` is enforced, never trusted as-is. */
  args: TArgs;
}

export class CrossTenantQueryAttemptError extends Error {
  constructor(
    public readonly sessionTenantId: string,
    public readonly attemptedTenantId: string,
  ) {
    super(
      `Cross-tenant query attempt blocked: session is scoped to tenant "${sessionTenantId}" but the query requested tenant "${attemptedTenantId}".`,
    );
    this.name = "CrossTenantQueryAttemptError";
  }
}

/**
 * Audit-logs a blocked cross-tenant attempt using the same `audit_logs`
 * table and reason vocabulary as the PDP (core/policy/PolicyDecisionPoint).
 * Best-effort: a failure here must never suppress the
 * CrossTenantQueryAttemptError the caller is about to throw, so failures
 * are swallowed after being logged to the console.
 */
async function logCrossTenantAttempt(session: ValidatedSession, attemptedTenantId: string, resource: string): Promise<void> {
  console.error("[tenantScopedQuery] cross-tenant query attempt blocked", {
    sessionUserId: session.userId,
    sessionTenantId: session.tenantId,
    attemptedTenantId,
    resource,
  });

  try {
    const subject = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } });

    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        timestamp: new Date(),
        tenantId: session.tenantId,
        subjectId: session.userId,
        subjectEmail: subject?.email ?? "unknown",
        action: "READ",
        resource,
        outcome: "DENY",
        reason: "tenant_isolation_violation",
        ipAddress: "internal",
      },
    });
  } catch (auditError) {
    console.error("[tenantScopedQuery] failed to persist cross-tenant audit log", auditError);
  }
}

/**
 * Secure data-fetching wrapper for Next.js Server Components. Accepts the
 * caller's validated session context and a single query configuration
 * (which Prisma operation to run, plus its `where`/`orderBy`/etc. args),
 * and forces every query's `where` clause to carry the session's tenant_id
 * -- the caller's `where` can never widen or override it. There is no
 * "unscoped" code path: `run` only ever receives args that already have
 * `tenantId` set to the session's own tenant.
 *
 * If the caller's queryConfig.where already specifies a *different*
 * tenantId, that's treated as a cross-tenant attempt rather than silently
 * overwritten -- it's logged (logCrossTenantAttempt) and rejected, since a
 * caller passing the wrong tenant_id is almost always a bug upstream worth
 * surfacing loudly.
 */
export async function tenantScopedQuery<TArgs extends { where?: Record<string, unknown> }, TResult>(
  session: ValidatedSession,
  queryConfig: TenantScopedQueryConfig<TArgs, TResult>,
): Promise<TResult> {
  const { resource, run, args } = queryConfig;
  const requestedTenantId = (args.where as { tenantId?: string } | undefined)?.tenantId;

  if (requestedTenantId !== undefined && requestedTenantId !== session.tenantId) {
    await logCrossTenantAttempt(session, requestedTenantId, resource);
    throw new CrossTenantQueryAttemptError(session.tenantId, requestedTenantId);
  }

  // TS can't verify a fresh spread matches an unconstrained generic TArgs
  // even though it structurally does (TArgs always has an optional `where`
  // we're allowed to fill in) -- the cast is the standard escape for that.
  const scopedArgs = {
    ...args,
    where: { ...args.where, tenantId: session.tenantId },
  } as TArgs;

  return run(scopedArgs);
}

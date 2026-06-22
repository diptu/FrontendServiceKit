import type { Document, Prisma, User } from "@prisma/client";
import { getServerSession } from "@/core/auth/getServerSession";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import { prisma } from "@/lib/db/prismaClient";
import { CrossTenantQueryAttemptError, tenantScopedQuery, type ValidatedSession } from "@/lib/db/tenantScopedQuery";

type DocumentWithOwner = Document & { owner: Pick<User, "email"> };

/**
 * Reference implementation for Task 4 (lib/db/tenantScopedQuery.ts): every
 * Prisma read on this page goes through tenantScopedQuery, so there is no
 * code path here that can return another tenant's documents, however the
 * query is shaped.
 */
export default async function DocumentsPage() {
  const claims = await getServerSession();

  if (!claims) {
    // middleware.ts (PEP) and SecurityGuard already gate this route -- this
    // is a defensive fallback, not the primary authentication check.
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const session: ValidatedSession = {
    userId: claims.sub,
    tenantId: resolvePrismaTenantId(claims.tenant_org),
    role: mapClaimRoleToPolicyRole(claims.role),
  };

  // Explicit type args below: TArgs/TResult inference doesn't flow cleanly
  // through `run`'s own generic findMany() call, so we pin them at the call
  // site instead of fighting TypeScript's inference -- the runtime
  // tenant_id enforcement inside tenantScopedQuery doesn't depend on this
  // either way. The cast on `run`'s return is safe because `include` is
  // fixed in `args` below, we know the shape it actually returns.
  const documents = await tenantScopedQuery<Prisma.DocumentFindManyArgs, DocumentWithOwner[]>(session, {
    resource: "documents",
    run: (args) => prisma.document.findMany(args) as unknown as Promise<DocumentWithOwner[]>,
    args: {
      include: { owner: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    },
  });

  // Demonstration only: deliberately request a *different* tenant's
  // documents to show tenantScopedQuery catching and logging the attempt
  // instead of either silently scoping it away or letting it leak through.
  let blockedAttempt: string | null = null;
  const otherTenantId = session.tenantId === "apple_corp" ? "orange_teck" : "apple_corp";

  try {
    await tenantScopedQuery<Prisma.DocumentFindManyArgs, Document[]>(session, {
      resource: "documents",
      run: (args) => prisma.document.findMany(args),
      args: { where: { tenantId: otherTenantId } },
    });
  } catch (error) {
    if (error instanceof CrossTenantQueryAttemptError) {
      blockedAttempt = error.message;
    } else {
      throw error;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tenant-scoped document directory. Every query on this page runs through tenantScopedQuery.
        </p>
      </div>

      {blockedAttempt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Cross-tenant query blocked and logged:</span> {blockedAttempt}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Clearance Required</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((document) => (
              <tr key={document.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{document.title}</td>
                <td className="px-4 py-3 text-slate-600">{document.department ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{document.clearanceRequired}</td>
                <td className="px-4 py-3 text-slate-600">{document.owner.email}</td>
                <td className="px-4 py-3 text-slate-500">{document.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

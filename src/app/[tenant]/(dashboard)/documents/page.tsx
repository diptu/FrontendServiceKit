import { getServerSession } from "@/core/auth/getServerSession";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import mockData from "@/mock/data.json";

interface MockDocument {
  id: string;
  title: string;
  department: string | null;
  clearanceRequired: number;
  createdAt: string;
}

/**
 * data.json has no "documents" collection (tenants/users/auditLogs only,
 * per its own spec) -- these are a handful of static rows per tenant,
 * purely decorative, so this page has something to render. There's no
 * database behind this frontend (removed: doesn't survive Vercel's
 * serverless filesystem) and no real backend documents endpoint yet.
 */
function buildMockDocuments(tenantName: string): MockDocument[] {
  return [
    { id: "doc-1", title: `${tenantName} Onboarding Guide`, department: null, clearanceRequired: 1, createdAt: "2024-01-20" },
    { id: "doc-2", title: `${tenantName} Q3 Financials`, department: "Finance", clearanceRequired: 4, createdAt: "2024-09-30" },
    { id: "doc-3", title: `${tenantName} Security Incident Log`, department: "IT Security", clearanceRequired: 5, createdAt: "2024-11-05" },
  ];
}

export default async function DocumentsPage() {
  const claims = await getServerSession();

  if (!claims) {
    // middleware.ts (PEP) and SecurityGuard already gate this route -- this
    // is a defensive fallback, not the primary authentication check.
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const tenantRecordId = resolvePrismaTenantId(claims.tenant_org);
  const tenant = mockData.tenants[tenantRecordId as keyof typeof mockData.tenants];
  const owner = mockData.users.find((user) => user.tenant_id === tenantRecordId);
  const documents = tenant ? buildMockDocuments(tenant.name) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">Tenant-scoped document directory.</p>
      </div>

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
                <td className="px-4 py-3 text-slate-600">{owner?.email ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(document.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { getServerSession } from "@/core/auth/getServerSession";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import mockData from "@/mock/data.json";
import { Card, CardHeader, CardBody, DataTable, type Column, Badge } from "@/components/ui";

interface MockDocument {
  id: string; title: string; department: string | null;
  clearanceRequired: number; createdAt: string;
  owner?: string;
}

function buildMockDocuments(tenantName: string): MockDocument[] {
  return [
    { id: "doc-1", title: `${tenantName} Onboarding Guide`,       department: null,        clearanceRequired: 1, createdAt: "2024-01-20" },
    { id: "doc-2", title: `${tenantName} Q3 Financials`,          department: "Finance",   clearanceRequired: 4, createdAt: "2024-09-30" },
    { id: "doc-3", title: `${tenantName} Security Incident Log`,  department: "IT Security", clearanceRequired: 5, createdAt: "2024-11-05" },
  ];
}

const COLUMNS: Column<MockDocument>[] = [
  { key: "title",            header: "Title",              render: d => <span className="font-medium text-slate-800">{d.title}</span> },
  { key: "department",       header: "Department",         render: d => <span className="text-slate-600">{d.department ?? "—"}</span> },
  {
    key: "clearanceRequired", header: "Clearance",
    render: d => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i < d.clearanceRequired ? "bg-indigo-500" : "bg-slate-200"}`} />
        ))}
        <span className="ml-1.5 text-xs text-slate-400">L{d.clearanceRequired}</span>
      </div>
    ),
  },
  { key: "owner",            header: "Owner",              render: d => <span className="text-slate-600">{d.owner ?? "—"}</span> },
  {
    key: "createdAt",        header: "Created",
    render: d => <Badge variant="muted" size="xs">{new Date(d.createdAt).toLocaleDateString()}</Badge>,
  },
];

export default async function DocumentsPage() {
  const claims = await getServerSession();

  if (!claims) {
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const tenantRecordId = resolvePrismaTenantId(claims.tenant_org);
  const tenant  = mockData.tenants[tenantRecordId as keyof typeof mockData.tenants];
  const owner   = mockData.users.find(u => u.tenant_id === tenantRecordId);
  const rawDocs = tenant ? buildMockDocuments(tenant.name) : [];
  const documents = rawDocs.map(d => ({ ...d, owner: owner?.email }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">Tenant-scoped document directory.</p>
      </div>

      <Card>
        <CardHeader title="Document Library" />
        <DataTable<MockDocument>
          columns={COLUMNS}
          data={documents}
          rowKey={d => d.id}
        />
      </Card>
    </div>
  );
}

import { Server, Plus, RefreshCw } from "lucide-react";
import {
  Banner, Button, StatusBadge, RoleBadge, Badge,
  DataTable, type Column,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

const SERVICE_ACCOUNTS = [
  { id: "sa1", name: "ci-pipeline-bot",    description: "GitHub Actions CI/CD runner",      role: "Developer", status: "active",   lastUsed: "3 min ago",  tokenExpires: "Aug 12, 2026" },
  { id: "sa2", name: "monitoring-agent",   description: "Prometheus + alerting stack",       role: "Viewer",    status: "active",   lastUsed: "1 min ago",  tokenExpires: "Jul 30, 2026" },
  { id: "sa3", name: "backup-service",     description: "Nightly DB and file-store backups", role: "Developer", status: "active",   lastUsed: "8 hr ago",   tokenExpires: "Sep 01, 2026" },
  { id: "sa4", name: "api-gateway-client", description: "Internal service mesh auth",        role: "Admin",     status: "active",   lastUsed: "5 min ago",  tokenExpires: "Jul 15, 2026" },
  { id: "sa5", name: "legacy-sync-bot",    description: "Deprecated data migration script",  role: "Viewer",    status: "inactive", lastUsed: "45 days ago",tokenExpires: "Expired"      },
];

type SA = typeof SERVICE_ACCOUNTS[0];

const COLUMNS: Column<SA>[] = [
  {
    key: "name", header: "Service Account",
    render: sa => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Server className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
        </div>
        <div>
          <code className="text-xs font-medium text-slate-900">{sa.name}</code>
          <p className="text-xs text-slate-400">{sa.description}</p>
        </div>
      </div>
    ),
  },
  { key: "role",   header: "Role",     render: sa => <RoleBadge role={sa.role} /> },
  { key: "status", header: "Status",   render: sa => <StatusBadge status={sa.status} dot /> },
  { key: "lastUsed", header: "Last Used", className: "text-xs text-slate-500" },
  {
    key: "tokenExpires", header: "Token Expires",
    render: sa => (
      <Badge variant={sa.tokenExpires === "Expired" ? "error" : "muted"} size="xs">
        {sa.tokenExpires}
      </Badge>
    ),
  },
  {
    key: "actions", header: "", align: "right" as const,
    render: () => (
      <Button variant="secondary" size="xs" icon={RefreshCw}>Rotate</Button>
    ),
  },
];

export default async function ServiceAccountsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — service account management is read-only until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Server className="h-5 w-5 text-indigo-500" />Service Accounts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Machine identities in <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus}>Create Service Account</Button>
      </div>

      <DataTable<SA>
        columns={COLUMNS}
        data={SERVICE_ACCOUNTS}
        rowKey={sa => sa.id}
        emptyTitle="No service accounts"
        emptyIcon={Server}
      />

      <p className="text-xs text-slate-400 text-right">
        {SERVICE_ACCOUNTS.length} service accounts · {SERVICE_ACCOUNTS.filter(sa => sa.status === "active").length} active
      </p>
    </div>
  );
}

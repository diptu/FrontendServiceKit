import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { Server, Plus, RefreshCw } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

const SERVICE_ACCOUNTS = [
  { id: "sa1", name: "ci-pipeline-bot",     description: "GitHub Actions CI/CD runner",           role: "Developer",   status: "active",   lastUsed: "3 min ago",  tokenExpires: "Aug 12, 2026" },
  { id: "sa2", name: "monitoring-agent",    description: "Prometheus + alerting stack",            role: "Viewer",      status: "active",   lastUsed: "1 min ago",  tokenExpires: "Jul 30, 2026" },
  { id: "sa3", name: "backup-service",      description: "Nightly DB and file-store backups",      role: "Developer",   status: "active",   lastUsed: "8 hr ago",   tokenExpires: "Sep 01, 2026" },
  { id: "sa4", name: "api-gateway-client",  description: "Internal service mesh auth",             role: "Admin",       status: "active",   lastUsed: "5 min ago",  tokenExpires: "Jul 15, 2026" },
  { id: "sa5", name: "legacy-sync-bot",     description: "Deprecated data migration script",       role: "Viewer",      status: "inactive", lastUsed: "45 days ago",tokenExpires: "Expired"      },
];

export default async function ServiceAccountsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — service account management is read-only until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Server className="h-5 w-5 text-indigo-500" />Service Accounts
          </h1>
          <p className="mt-1 text-sm text-slate-500">Machine identities in <span className="font-medium text-slate-700">{display}</span></p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          <Plus className="h-4 w-4" />Create Service Account
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Name</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Role</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Last Used</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Token Expires</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {SERVICE_ACCOUNTS.map(sa => (
              <tr key={sa.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Server className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-medium text-slate-900">{sa.name}</p>
                      <p className="text-xs text-slate-400">{sa.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{sa.role}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${sa.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {sa.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{sa.lastUsed}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium ${sa.tokenExpires === "Expired" ? "text-red-600" : "text-slate-700"}`}>
                    {sa.tokenExpires}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    <RefreshCw className="h-3 w-3" />Rotate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">{SERVICE_ACCOUNTS.length} service accounts</p>
        </div>
      </div>
    </div>
  );
}

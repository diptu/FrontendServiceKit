import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { ShieldCheck, Plus } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

const ROLES = [
  { id: "r1", name: "Super Admin",   description: "Unrestricted access to all org resources",          users: 3,   permissions: 48, color: "bg-red-100 text-red-700"     },
  { id: "r2", name: "Admin",         description: "Full org management excluding billing",               users: 12,  permissions: 36, color: "bg-violet-100 text-violet-700" },
  { id: "r3", name: "Moderator",     description: "User and group management; read-only on policies",   users: 28,  permissions: 22, color: "bg-indigo-100 text-indigo-700" },
  { id: "r4", name: "Developer",     description: "Application access and API key management",           users: 156, permissions: 15, color: "bg-sky-100 text-sky-700"       },
  { id: "r5", name: "Support Agent", description: "Read users and sessions; cannot modify records",     users: 89,  permissions: 8,  color: "bg-amber-100 text-amber-700"   },
  { id: "r6", name: "Viewer",        description: "Read-only access to non-sensitive resources",        users: 890, permissions: 5,  color: "bg-slate-100 text-slate-600"   },
];

export default async function RolesPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — role management is read-only until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">IAM roles defined in <span className="font-medium text-slate-700">{display}</span></p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          <Plus className="h-4 w-4" />New Role
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map(role => (
          <div key={role.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${role.color}`}>
                {role.name[0]}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{role.name}</p>
                <p className="text-xs text-slate-400">{role.permissions} permissions</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{role.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">{role.users}</span> users assigned
              </span>
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Role Summary</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-2 pr-6 text-left font-semibold text-slate-500">Role</th>
                <th className="pb-2 pr-6 text-right font-semibold text-slate-500">Users</th>
                <th className="pb-2 pr-6 text-right font-semibold text-slate-500">Permissions</th>
                <th className="pb-2 text-right font-semibold text-slate-500">% of Org</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map(role => {
                const total = ROLES.reduce((s, r) => s + r.users, 0);
                return (
                  <tr key={role.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 pr-6 font-medium text-slate-800">{role.name}</td>
                    <td className="py-2 pr-6 text-right text-slate-700">{role.users.toLocaleString()}</td>
                    <td className="py-2 pr-6 text-right text-slate-700">{role.permissions}</td>
                    <td className="py-2 text-right text-slate-500">{((role.users / total) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

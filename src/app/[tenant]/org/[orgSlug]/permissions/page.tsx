import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { KeyRound, Plus } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

const PERMISSIONS = [
  { id: "p1",  scope: "users:read",       resource: "Users",       action: "Read",   roles: ["Admin", "Moderator", "Support Agent", "Viewer"], system: true  },
  { id: "p2",  scope: "users:write",      resource: "Users",       action: "Write",  roles: ["Admin", "Moderator"],                             system: true  },
  { id: "p3",  scope: "users:delete",     resource: "Users",       action: "Delete", roles: ["Super Admin", "Admin"],                           system: true  },
  { id: "p4",  scope: "groups:read",      resource: "Groups",      action: "Read",   roles: ["Admin", "Moderator", "Viewer"],                   system: true  },
  { id: "p5",  scope: "groups:write",     resource: "Groups",      action: "Write",  roles: ["Admin", "Moderator"],                             system: true  },
  { id: "p6",  scope: "apps:read",        resource: "Applications",action: "Read",   roles: ["Admin", "Developer", "Viewer"],                   system: true  },
  { id: "p7",  scope: "apps:write",       resource: "Applications",action: "Write",  roles: ["Admin", "Developer"],                             system: true  },
  { id: "p8",  scope: "policies:read",    resource: "Policies",    action: "Read",   roles: ["Admin"],                                          system: true  },
  { id: "p9",  scope: "policies:write",   resource: "Policies",    action: "Write",  roles: ["Super Admin", "Admin"],                           system: true  },
  { id: "p10", scope: "billing:read",     resource: "Billing",     action: "Read",   roles: ["Super Admin", "Admin"],                           system: true  },
  { id: "p11", scope: "billing:write",    resource: "Billing",     action: "Write",  roles: ["Super Admin"],                                    system: true  },
  { id: "p12", scope: "sessions:revoke",  resource: "Sessions",    action: "Write",  roles: ["Super Admin", "Admin", "Moderator"],              system: false },
];

const ACTION_STYLES: Record<string, string> = {
  Read:   "bg-sky-50 text-sky-700",
  Write:  "bg-amber-50 text-amber-700",
  Delete: "bg-red-50 text-red-700",
};

export default async function PermissionsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — permission management is read-only until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <KeyRound className="h-5 w-5 text-indigo-500" />Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">All permission scopes in <span className="font-medium text-slate-700">{display}</span></p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          <Plus className="h-4 w-4" />New Permission
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Scope</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Resource</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Action</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Granted to</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {PERMISSIONS.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-medium text-indigo-700">{p.scope}</td>
                <td className="px-5 py-3.5 text-slate-700">{p.resource}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_STYLES[p.action] ?? "bg-slate-100 text-slate-600"}`}>
                    {p.action}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {p.roles.map(r => (
                      <span key={r} className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">{r}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${p.system ? "bg-slate-100 text-slate-500" : "bg-violet-50 text-violet-700"}`}>
                    {p.system ? "System" : "Custom"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">Showing {PERMISSIONS.length} permissions</p>
        </div>
      </div>
    </div>
  );
}

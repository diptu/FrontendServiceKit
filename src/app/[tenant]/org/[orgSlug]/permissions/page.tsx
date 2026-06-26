import { KeyRound, Plus } from "lucide-react";
import {
  Banner, Button, Badge, RoleBadge,
  DataTable, type Column,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

const PERMISSIONS = [
  { id: "p1",  scope: "users:read",      resource: "Users",        action: "Read",   roles: ["Admin","Moderator","Support Agent","Viewer"], system: true  },
  { id: "p2",  scope: "users:write",     resource: "Users",        action: "Write",  roles: ["Admin","Moderator"],                          system: true  },
  { id: "p3",  scope: "users:delete",    resource: "Users",        action: "Delete", roles: ["Super Admin","Admin"],                        system: true  },
  { id: "p4",  scope: "groups:read",     resource: "Groups",       action: "Read",   roles: ["Admin","Moderator","Viewer"],                 system: true  },
  { id: "p5",  scope: "groups:write",    resource: "Groups",       action: "Write",  roles: ["Admin","Moderator"],                          system: true  },
  { id: "p6",  scope: "apps:read",       resource: "Applications", action: "Read",   roles: ["Admin","Developer","Viewer"],                 system: true  },
  { id: "p7",  scope: "apps:write",      resource: "Applications", action: "Write",  roles: ["Admin","Developer"],                          system: true  },
  { id: "p8",  scope: "policies:read",   resource: "Policies",     action: "Read",   roles: ["Admin"],                                      system: true  },
  { id: "p9",  scope: "policies:write",  resource: "Policies",     action: "Write",  roles: ["Super Admin","Admin"],                        system: true  },
  { id: "p10", scope: "billing:read",    resource: "Billing",      action: "Read",   roles: ["Super Admin","Admin"],                        system: true  },
  { id: "p11", scope: "billing:write",   resource: "Billing",      action: "Write",  roles: ["Super Admin"],                               system: true  },
  { id: "p12", scope: "sessions:revoke", resource: "Sessions",     action: "Write",  roles: ["Super Admin","Admin","Moderator"],            system: false },
];

type Permission = typeof PERMISSIONS[0];

const ACTION_VARIANT: Record<string, "info" | "warning" | "error"> = {
  Read:   "info",
  Write:  "warning",
  Delete: "error",
};

const COLUMNS: Column<Permission>[] = [
  {
    key: "scope", header: "Scope",
    render: p => <code className="font-mono text-xs font-medium text-indigo-700 bg-indigo-50 rounded px-1.5 py-0.5">{p.scope}</code>,
  },
  { key: "resource", header: "Resource", className: "text-slate-700" },
  {
    key: "action", header: "Action",
    render: p => <Badge variant={ACTION_VARIANT[p.action] ?? "muted"}>{p.action}</Badge>,
  },
  {
    key: "roles", header: "Granted to",
    render: p => (
      <div className="flex flex-wrap gap-1">
        {p.roles.map(r => <RoleBadge key={r} role={r} />)}
      </div>
    ),
  },
  {
    key: "system", header: "Type",
    render: p => <Badge variant={p.system ? "muted" : "violet"} size="xs">{p.system ? "System" : "Custom"}</Badge>,
  },
];

export default async function PermissionsPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — permission management is read-only until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <KeyRound className="h-5 w-5 text-indigo-500" />Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All permission scopes in <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus}>New Permission</Button>
      </div>

      <DataTable<Permission>
        columns={COLUMNS}
        data={PERMISSIONS}
        rowKey={p => p.id}
        emptyTitle="No permissions defined"
        emptyIcon={KeyRound}
      />

      <p className="text-xs text-slate-400 text-right">
        Showing {PERMISSIONS.length} permissions · {PERMISSIONS.filter(p => p.system).length} system · {PERMISSIONS.filter(p => !p.system).length} custom
      </p>
    </div>
  );
}

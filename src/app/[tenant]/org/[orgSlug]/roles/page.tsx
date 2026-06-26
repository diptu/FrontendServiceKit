import { ShieldCheck, Plus, Users } from "lucide-react";
import {
  Banner, Button,
  Card, CardHeader, CardBody, CardFooter,
  RoleBadge,
  DataTable, type Column,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

const ROLES = [
  { id: "r1", name: "Super Admin",   description: "Unrestricted access to all org resources",         users: 3,   permissions: 48 },
  { id: "r2", name: "Admin",         description: "Full org management excluding billing",              users: 12,  permissions: 36 },
  { id: "r3", name: "Moderator",     description: "User and group management; read-only on policies",  users: 28,  permissions: 22 },
  { id: "r4", name: "Developer",     description: "Application access and API key management",          users: 156, permissions: 15 },
  { id: "r5", name: "Support Agent", description: "Read users and sessions; cannot modify records",    users: 89,  permissions: 8  },
  { id: "r6", name: "Viewer",        description: "Read-only access to non-sensitive resources",       users: 890, permissions: 5  },
];

const SUMMARY_COLS: Column<typeof ROLES[0]>[] = [
  { key: "name",        header: "Role",        render: r => <RoleBadge role={r.name} /> },
  { key: "users",       header: "Users",       align: "right", render: r => <span className="text-sm font-semibold text-slate-900">{r.users.toLocaleString()}</span> },
  { key: "permissions", header: "Permissions", align: "right", render: r => <span className="text-sm text-slate-700">{r.permissions}</span> },
  {
    key: "pct", header: "% of Org", align: "right",
    render: r => {
      const total = ROLES.reduce((s, x) => s + x.users, 0);
      return <span className="text-sm text-slate-500">{((r.users / total) * 100).toFixed(1)}%</span>;
    },
  },
];

export default async function RolesPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — role management is read-only until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            IAM roles defined in <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus}>New Role</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map(role => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader
              title={role.name}
              description={`${role.permissions} permissions`}
              icon={<RoleBadge role={role.name} />}
            />
            <CardBody>
              <p className="text-xs leading-relaxed text-slate-500">{role.description}</p>
            </CardBody>
            <CardFooter align="between">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{role.users.toLocaleString()}</span> users
              </span>
              <Button variant="outline" size="sm">Edit</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Role Summary" description="User distribution across roles" />
        <CardBody padding="none">
          <DataTable<typeof ROLES[0]>
            columns={SUMMARY_COLS}
            data={ROLES}
            rowKey={r => r.id}
          />
        </CardBody>
      </Card>
    </div>
  );
}

import { getServerSession } from "@/core/auth/getServerSession";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import mockData from "@/mock/data.json";
import { Building2, ShieldCheck, ShieldOff, Lock, CheckCircle2, XCircle } from "lucide-react";
import {
  StatCard, Badge, StatusBadge,
  Card, CardHeader,
  DataTable, type Column,
} from "@/components/ui";

interface RosterUser {
  id: string; email: string; role: string; department: string;
  clearance: number; mfa_verified: boolean; account_locked: boolean;
}

const ROLE_VARIANT: Record<string, "violet"|"info"|"success"|"muted"> = {
  Admin:     "violet",
  Moderator: "info",
  Member:    "success",
  User:      "muted",
};

const COLUMNS: Column<RosterUser>[] = [
  { key: "email",      header: "Email",      render: u => <span className="font-medium text-slate-800">{u.email}</span> },
  { key: "role",       header: "Role",       render: u => <Badge variant={ROLE_VARIANT[u.role] ?? "muted"} size="xs">{u.role}</Badge> },
  { key: "department", header: "Department", className: "text-slate-600" },
  {
    key: "clearance", header: "Clearance",
    render: u => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i < u.clearance ? "bg-indigo-500" : "bg-slate-200"}`} />
        ))}
        <span className="ml-1.5 text-xs text-slate-400">L{u.clearance}</span>
      </div>
    ),
  },
  {
    key: "mfa_verified", header: "MFA",
    render: u => u.mfa_verified
      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
      : <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"><XCircle className="h-3.5 w-3.5" /> Pending</span>,
  },
  {
    key: "account_locked", header: "Account",
    render: u => <StatusBadge status={u.account_locked ? "locked" : "active"} dot />,
  },
];

export default async function OrganizationRosterPage() {
  const claims = await getServerSession();

  if (!claims) {
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const tenantRecordId = resolvePrismaTenantId(claims.tenant_org);
  const tenant = mockData.tenants[tenantRecordId as keyof typeof mockData.tenants];
  const users  = mockData.users.filter(u => u.tenant_id === tenantRecordId) as RosterUser[];

  if (!tenant) {
    return <p className="text-sm text-slate-500">Tenant data could not be loaded.</p>;
  }

  const adminCount     = users.filter(u => u.role === "Admin").length;
  const moderatorCount = users.filter(u => u.role === "Moderator").length;
  const lockedCount    = users.filter(u => u.account_locked).length;
  const mfaCount       = users.filter(u => u.mfa_verified).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Organization Roster</h1>
          <p className="mt-1 text-sm text-slate-500">
            All members of <span className="font-medium text-slate-700">{tenant.name}</span> —{" "}
            {users.length} of {tenant.settings.max_users} seats used.
          </p>
        </div>
        <StatusBadge status={tenant.status} dot />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Building2}   label="Total Members"   value={users.length}           color="indigo"  />
        <StatCard icon={ShieldCheck} label="MFA Verified"    value={mfaCount}               color="emerald" />
        <StatCard icon={ShieldOff}   label="MFA Pending"     value={users.length - mfaCount} color="amber"  />
        <StatCard icon={Lock}        label="Locked Accounts" value={lockedCount}            color="rose"    />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="violet">{adminCount} Admin{adminCount !== 1 ? "s" : ""}</Badge>
        <Badge variant="info">{moderatorCount} Moderator{moderatorCount !== 1 ? "s" : ""}</Badge>
        <Badge variant="success">{users.filter(u => u.role === "Member").length} Members</Badge>
        <Badge variant="muted">{users.filter(u => u.role === "User").length} Users</Badge>
      </div>

      <Card>
        <CardHeader
          title="Member Directory"
          description={`Showing all ${users.length} members`}
        />
        <DataTable<RosterUser>
          columns={COLUMNS}
          data={users}
          rowKey={u => u.id}
        />
      </Card>
    </div>
  );
}

import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  AdminTable,
  PageHeader,
  PreviewBanner,
  StatCard,
  StatGrid,
} from "@/components/platform-admin/ui";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";
import mockData from "@/mock/data.json";
import { CheckCircle2, Lock, ShieldCheck, ShieldOff, Users, XCircle } from "lucide-react";

const AUTH_GATE_DISABLED = true;

type UserRole = "Admin" | "Moderator" | "Member" | "User";

const ROLE_STYLES: Record<UserRole, string> = {
  Admin:     "bg-violet-50 text-violet-700",
  Moderator: "bg-blue-50 text-blue-700",
  Member:    "bg-emerald-50 text-emerald-700",
  User:      "bg-gray-100 text-gray-600",
};

const TENANT_NAMES: Record<string, string> = {
  apple_corp:      "Apple Corp",
  orange_teck:     "Orange Teck",
  banana_republic: "Banana Republic",
};

export default async function AdminRosterPage() {
  const session = (await getPlatformAdminSession()) ?? (AUTH_GATE_DISABLED ? { id: "preview" } : null);
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Access denied.</p>
      </div>
    );
  }

  const users = mockData.users;
  const mfaCount    = users.filter((u) => u.mfa_verified).length;
  const lockedCount = users.filter((u) => u.account_locked).length;

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId={session.id}>
      <div className="flex flex-col gap-6">
        <PreviewBanner>Preview mode — auth gate disabled for local dev.</PreviewBanner>

        <PageHeader title="User Roster" subtitle={`All users across every tenant — ${users.length} total accounts.`} />

        <StatGrid cols={4}>
          <StatCard icon={Users}      value={users.length}            label="Total Users"     bg="bg-indigo-50"  color="text-indigo-600"  />
          <StatCard icon={ShieldCheck} value={mfaCount}               label="MFA Verified"    bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={ShieldOff}  value={users.length - mfaCount} label="MFA Pending"     bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Lock}       value={lockedCount}              label="Locked Accounts" bg="bg-red-50"     color="text-red-600"     />
        </StatGrid>

        <div className="flex flex-wrap gap-2">
          {(["Admin", "Moderator", "Member", "User"] as UserRole[]).map((role) => {
            const count = users.filter((u) => u.role === role).length;
            return (
              <span key={role} className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_STYLES[role]}`}>
                {count} {role}{count !== 1 ? "s" : ""}
              </span>
            );
          })}
        </div>

        <AdminTable
          title="All Users"
          subtitle="Platform-wide directory across all tenants"
          footer={<p className="text-xs text-slate-400">Showing all {users.length} users</p>}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Email", "Tenant", "Role", "Department", "Clearance", "MFA", "Account"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {TENANT_NAMES[user.tenant_id] ?? user.tenant_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role as UserRole] ?? "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`h-2 w-2 rounded-full ${i < user.clearance ? "bg-indigo-500" : "bg-slate-200"}`} />
                      ))}
                      <span className="ml-1.5 text-xs text-slate-400">L{user.clearance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.mfa_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"><XCircle className="h-3.5 w-3.5" />Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.account_locked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"><Lock className="h-3 w-3" />Locked</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}

import { getServerSession } from "@/core/auth/getServerSession";
import { resolvePrismaTenantId } from "@/core/tenant/tenantIdMap";
import mockData from "@/mock/data.json";
import { Building2, ShieldCheck, ShieldOff, Lock, CheckCircle2, XCircle } from "lucide-react";

type UserRole = "Admin" | "Moderator" | "Member" | "User";

const ROLE_STYLES: Record<UserRole, string> = {
  Admin:     "bg-violet-50 text-violet-700",
  Moderator: "bg-blue-50 text-blue-700",
  Member:    "bg-emerald-50 text-emerald-700",
  User:      "bg-gray-100 text-gray-600",
};

export default async function OrganizationRosterPage() {
  const claims = await getServerSession();

  if (!claims) {
    return <p className="text-sm text-slate-500">Your session could not be verified.</p>;
  }

  const tenantRecordId = resolvePrismaTenantId(claims.tenant_org);
  const tenant = mockData.tenants[tenantRecordId as keyof typeof mockData.tenants];
  const users = mockData.users.filter((u) => u.tenant_id === tenantRecordId);

  if (!tenant) {
    return <p className="text-sm text-slate-500">Tenant data could not be loaded.</p>;
  }

  const adminCount     = users.filter((u) => u.role === "Admin").length;
  const moderatorCount = users.filter((u) => u.role === "Moderator").length;
  const lockedCount    = users.filter((u) => u.account_locked).length;
  const mfaCount       = users.filter((u) => u.mfa_verified).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Organization Roster</h1>
          <p className="mt-1 text-sm text-slate-500">
            All members of <span className="font-medium text-slate-700">{tenant.name}</span> —{" "}
            {users.length} of {tenant.settings.max_users} seats used.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
        </span>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Members",    value: users.length,    icon: Building2,    color: "text-indigo-600",  bg: "bg-indigo-50"  },
          { label: "MFA Verified",     value: mfaCount,        icon: ShieldCheck,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "MFA Pending",      value: users.length - mfaCount, icon: ShieldOff, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Locked Accounts",  value: lockedCount,     icon: Lock,         color: "text-red-600",     bg: "bg-red-50"     },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </section>

      {/* Role breakdown chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: `${adminCount} Admin${adminCount !== 1 ? "s" : ""}`,         style: ROLE_STYLES["Admin"]     },
          { label: `${moderatorCount} Moderator${moderatorCount !== 1 ? "s" : ""}`, style: ROLE_STYLES["Moderator"] },
          { label: `${users.filter((u) => u.role === "Member").length} Members`, style: ROLE_STYLES["Member"]    },
          { label: `${users.filter((u) => u.role === "User").length} Users`,     style: ROLE_STYLES["User"]      },
        ].map((chip) => (
          <span key={chip.label} className={`rounded-full px-3 py-1 text-xs font-medium ${chip.style}`}>
            {chip.label}
          </span>
        ))}
      </div>

      {/* Roster table */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Member Directory</h2>
          <p className="text-xs text-slate-400">Showing all {users.length} members</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Clearance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">MFA</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role as UserRole] ?? "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-2 rounded-full ${i < user.clearance ? "bg-indigo-500" : "bg-gray-200"}`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs text-slate-400">L{user.clearance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.mfa_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        <XCircle className="h-3.5 w-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.account_locked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

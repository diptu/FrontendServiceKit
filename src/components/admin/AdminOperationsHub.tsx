"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Building2, Lock, Search, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { useAuthorization } from "@/core/auth/AuthorizationContext";

export type DirectoryRole = "Admin" | "Moderator" | "Member" | "User";

export interface TenantMetadata {
  tenantId: string;
  name: string;
  plan: string;
  status: string;
  memberSeatsUsed: number;
  memberSeatsLimit: number;
}

export interface DirectoryUser {
  id: string;
  email: string;
  role: DirectoryRole;
  department: string;
  clearance: number;
  mfaVerified: boolean;
  accountLocked: boolean;
}

interface AdminOperationsHubProps {
  tenant: TenantMetadata;
  users: DirectoryUser[];
}

const ROLE_FILTERS: ReadonlyArray<DirectoryRole | "All"> = ["All", "Admin", "Moderator", "Member", "User"];

const ROLE_BADGE_STYLES: Record<DirectoryRole, string> = {
  Admin: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Moderator: "bg-sky-50 text-sky-700 border border-sky-200",
  Member: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  User: "bg-slate-100 text-slate-600 border border-slate-200",
};

function StatBadge({ label, tone }: { label: string; tone: "ok" | "warn" | "danger" }) {
  const toneStyles: Record<typeof tone, string> = {
    ok: "bg-green-50 text-green-700 border border-green-200",
    warn: "bg-orange-50 text-orange-700 border border-orange-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
  };

  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${toneStyles[tone]}`}>{label}</span>;
}

interface InviteModalProps {
  onClose: () => void;
  onInvite: (invite: { email: string; role: DirectoryRole; department: string }) => void;
}

function InviteModal({ onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<DirectoryRole>("Member");
  const [department, setDepartment] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onInvite({ email, role, department });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Dispatch onboarding invitation</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="text-sm text-slate-600">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="text-sm text-slate-600">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as DirectoryRole)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {(["Admin", "Moderator", "Member", "User"] as DirectoryRole[]).map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-600">
            Department
            <input
              type="text"
              required
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Send invitation
          </button>
        </form>
      </div>
    </div>
  );
}

interface RoleAdjustmentModalProps {
  user: DirectoryUser;
  onClose: () => void;
  onAdjust: (userId: string, newRole: DirectoryRole) => void;
}

function RoleAdjustmentModal({ user, onClose, onAdjust }: RoleAdjustmentModalProps) {
  const [newRole, setNewRole] = useState<DirectoryRole>(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Adjust role</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">{user.email}</p>

        <select
          value={newRole}
          onChange={(event) => setNewRole(event.target.value as DirectoryRole)}
          className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {(["Admin", "Moderator", "Member", "User"] as DirectoryRole[]).map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onAdjust(user.id, newRole)}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Apply role change
        </button>
      </div>
    </div>
  );
}

/**
 * Tenant Administrative Operations hub (Phase 3 ABAC UI). Only reachable
 * via app/[tenant]/(dashboard)/admin, already gated by RoleGuard
 * (allowedRoles=["ADMIN"], requireMfa) -- the useAuthorization() checks
 * below are a second, finer-grained layer for the individual actions on
 * this page, in case it's ever reused somewhere with mixed roles.
 *
 * Invite/role-adjustment actions are optimistic, client-only state updates
 * -- there's no `/users/invite` or `/users/:id/role` endpoint on the
 * FastAPI gateway yet (see lib/api/client.ts), so this demonstrates the
 * interaction pattern without inventing a backend contract.
 */
export default function AdminOperationsHub({ tenant, users: initialUsers }: AdminOperationsHubProps) {
  const { can } = useAuthorization();

  const [users, setUsers] = useState<DirectoryUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("All");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [adjustingUser, setAdjustingUser] = useState<DirectoryUser | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canManageUsers = can("UPDATE", "users");
  const canInvite = can("WRITE", "users");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.department.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  function handleInvite(invite: { email: string; role: DirectoryRole; department: string }) {
    setUsers((current) => [
      ...current,
      {
        id: `pending-${crypto.randomUUID()}`,
        email: invite.email,
        role: invite.role,
        department: invite.department,
        clearance: 1,
        mfaVerified: false,
        accountLocked: false,
      },
    ]);
    setIsInviteModalOpen(false);
    showToast(`Invitation dispatched to ${invite.email}.`);
  }

  function handleRoleAdjustment(userId: string, newRole: DirectoryRole) {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
    setAdjustingUser(null);
    showToast("Role updated.");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Admin Operations</h1>
          <p className="mt-1 text-sm text-slate-500">Tenant membership, roles, and onboarding for {tenant.name}.</p>
        </div>

        {canInvite && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" />
            Invite member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <Building2 className="h-8 w-8 text-indigo-600" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tenant</p>
            <p className="text-base font-semibold text-slate-800">{tenant.name}</p>
            <p className="text-xs text-slate-500">{tenant.plan} plan</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <Users className="h-8 w-8 text-indigo-600" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Member seats</p>
            <p className="text-base font-semibold text-slate-800">
              {tenant.memberSeatsUsed} / {tenant.memberSeatsLimit}
            </p>
            <p className="text-xs text-slate-500">active member seats</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="h-8 w-8 text-indigo-600" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">License status</p>
            <p className="text-base font-semibold capitalize text-slate-800">{tenant.status}</p>
            <p className="text-xs text-slate-500">subscription standing</p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">{toast}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or department"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ROLE_FILTERS.map((roleOption) => (
              <button
                key={roleOption}
                type="button"
                onClick={() => setRoleFilter(roleOption)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  roleFilter === roleOption
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                {roleOption}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Clearance</th>
              <th className="px-4 py-3 font-medium">MFA</th>
              <th className="px-4 py-3 font-medium">Account</th>
              {canManageUsers && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE_STYLES[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.department}</td>
                <td className="px-4 py-3 text-slate-600">{user.clearance}</td>
                <td className="px-4 py-3">
                  <StatBadge label={user.mfaVerified ? "Verified" : "Pending"} tone={user.mfaVerified ? "ok" : "warn"} />
                </td>
                <td className="px-4 py-3">
                  <StatBadge label={user.accountLocked ? "Locked" : "Active"} tone={user.accountLocked ? "danger" : "ok"} />
                </td>
                {canManageUsers && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setAdjustingUser(user)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-gray-50"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Adjust role
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={canManageUsers ? 7 : 6} className="px-4 py-8 text-center text-sm text-slate-400">
                  No members match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && <InviteModal onClose={() => setIsInviteModalOpen(false)} onInvite={handleInvite} />}
      {adjustingUser && (
        <RoleAdjustmentModal
          user={adjustingUser}
          onClose={() => setAdjustingUser(null)}
          onAdjust={handleRoleAdjustment}
        />
      )}
    </div>
  );
}

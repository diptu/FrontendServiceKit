"use client";

import { useState } from "react";
import { MoreHorizontal, CheckCircle2 } from "lucide-react";
import type { User, UserStatus } from "@/types/iam";

const STATUS_BADGE_STYLES: Record<UserStatus, string> = {
  active: "bg-green-50 text-green-700 border border-green-200",
  mfa_pending: "bg-orange-50 text-orange-700 border border-orange-200",
  suspended: "bg-gray-100 text-gray-600 border border-gray-300",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  mfa_pending: "Pending",
  suspended: "Revoked",
};

const DEFAULT_USERS: User[] = [
  {
    id: "usr_3091",
    name: "Maya Castellano",
    email: "maya.castellano@nutratenant.io",
    status: "active",
    client_id: "client_root_01",
    assigned_roles: ["org_admin", "policy_editor"],
  },
  {
    id: "usr_3092",
    name: "Devon Whitfield",
    email: "devon.whitfield@nutratenant.io",
    status: "mfa_pending",
    client_id: "client_root_01",
    assigned_roles: ["billing_viewer"],
  },
  {
    id: "usr_3093",
    name: "Priya Nandakumar",
    email: "priya.nandakumar@nutratenant.io",
    status: "active",
    client_id: "client_sub_07",
    assigned_roles: ["token_issuer", "audit_viewer", "support_agent"],
  },
  {
    id: "usr_3094",
    name: "Felix Ahonen",
    email: "felix.ahonen@nutratenant.io",
    status: "suspended",
    client_id: "client_sub_07",
    assigned_roles: ["support_agent"],
  },
];

interface UserDirectoryTableProps {
  users?: User[];
}

export default function UserDirectoryTable({ users = DEFAULT_USERS }: UserDirectoryTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  function toggleMenu(userId: string): void {
    setOpenMenuId((current) => (current === userId ? null : userId));
  }

  function handleAction(userId: string, action: string): void {
    console.log(JSON.stringify({ userId, action }, null, 2));
    setOpenMenuId(null);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-800">User Access Directory</h2>
        <p className="mt-1 text-sm text-slate-500">
          Validate tenant membership, assigned roles, and account standing across the client base.
        </p>
      </div>

      <table className="w-full table-auto border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Client</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Assigned Roles</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-indigo-50/40"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">{user.name}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600">{user.client_id}</span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[user.status]}`}
                >
                  {user.status === "active" && (
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                  {STATUS_LABELS[user.status]}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {user.assigned_roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </td>
              <td className="relative px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => toggleMenu(user.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Manage Permissions
                  <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                </button>

                {openMenuId === user.id && (
                  <div className="absolute right-6 top-14 z-20 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => handleAction(user.id, "view_profile")}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-gray-50"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(user.id, "reset_mfa")}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-gray-50"
                    >
                      Reset MFA Enrollment
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(user.id, "suspend_access")}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-gray-50"
                    >
                      Suspend Access
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(user.id, "revoke_tokens")}
                      className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Revoke All Tokens
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openMenuId !== null && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-10 cursor-default"
        />
      )}
    </div>
  );
}

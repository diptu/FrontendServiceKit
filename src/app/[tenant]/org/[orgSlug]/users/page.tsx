import Link from "next/link";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { Users, Search, Filter, UserPlus } from "lucide-react";

interface OrgUsersPageProps {
  params: Promise<{ orgSlug: string }>;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "pending";
  lastSeen: string;
  mfa: boolean;
}

const MOCK_USERS: MockUser[] = [
  { id: "u001", name: "Alice Wright",   email: "alice.w@nutracorp.test",   role: "Admin",     status: "active",    lastSeen: "2 min ago",  mfa: true  },
  { id: "u002", name: "Bob Keller",     email: "bob.k@nutracorp.test",     role: "Moderator", status: "suspended", lastSeen: "3 hr ago",   mfa: true  },
  { id: "u003", name: "Charlie Nguyen", email: "charlie.n@nutracorp.test", role: "Member",    status: "active",    lastSeen: "1 hr ago",   mfa: false },
  { id: "u004", name: "Dana Osei",      email: "dana.o@nutracorp.test",    role: "Member",    status: "active",    lastSeen: "5 hr ago",   mfa: true  },
  { id: "u005", name: "Evan Marsh",     email: "evan.m@nutracorp.test",    role: "Member",    status: "pending",   lastSeen: "never",      mfa: false },
  { id: "u006", name: "Fatima Reyes",   email: "fatima.r@nutracorp.test",  role: "Moderator", status: "active",    lastSeen: "30 min ago", mfa: true  },
  { id: "u007", name: "George Lin",     email: "george.l@nutracorp.test",  role: "Member",    status: "active",    lastSeen: "1 day ago",  mfa: false },
  { id: "u008", name: "Hana Popov",     email: "hana.p@nutracorp.test",    role: "Member",    status: "active",    lastSeen: "2 day ago",  mfa: true  },
];

const STATUS_STYLES: Record<MockUser["status"], string> = {
  active:    "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  pending:   "bg-amber-50 text-amber-700",
};

const ROLE_STYLES: Record<string, string> = {
  Admin:     "bg-indigo-50 text-indigo-700",
  Moderator: "bg-violet-50 text-violet-700",
  Member:    "bg-slate-100 text-slate-600",
};

export default async function OrgUsersPage({ params }: OrgUsersPageProps) {
  const { orgSlug } = await params;
  const displayName = orgSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — user management is open for viewing. Write actions will be gated by role before GA.
      </PreviewBanner>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Users className="h-5 w-5 text-indigo-500" />
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All members of <span className="font-medium text-slate-700">{displayName}</span>
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Name</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Role</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">MFA</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Last Seen</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium ${user.mfa ? "text-emerald-600" : "text-slate-400"}`}>
                    {user.mfa ? "Enabled" : "Off"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{user.lastSeen}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/org/${orgSlug}/users/${user.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">Showing {MOCK_USERS.length} of 1,248 users</p>
          <div className="flex items-center gap-1.5">
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40" disabled>
              Previous
            </button>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

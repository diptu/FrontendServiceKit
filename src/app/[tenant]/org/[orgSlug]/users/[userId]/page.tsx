import Link from "next/link";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  User,
  UsersRound,
} from "lucide-react";

interface UserDetailPageProps {
  params: Promise<{ orgSlug: string; userId: string }>;
}

const MOCK_USER_MAP: Record<string, {
  name: string; email: string; role: string;
  status: "active" | "suspended" | "pending";
  mfa: boolean; joinedAt: string; lastSeen: string;
  groups: string[]; apps: string[]; sessions: number;
}> = {
  u001: { name: "Alice Wright",   email: "alice.w@nutracorp.test",   role: "Admin",     status: "active",    mfa: true,  joinedAt: "Jan 12, 2025", lastSeen: "2 min ago",  groups: ["Engineering", "Leadership"],  apps: ["NutraCRM", "SecurePass", "WorkflowPro"], sessions: 3 },
  u002: { name: "Bob Keller",     email: "bob.k@nutracorp.test",     role: "Moderator", status: "suspended", mfa: true,  joinedAt: "Mar 05, 2025", lastSeen: "3 hr ago",   groups: ["Support"],                     apps: ["NutraCRM"],                             sessions: 0 },
  u003: { name: "Charlie Nguyen", email: "charlie.n@nutracorp.test", role: "Member",    status: "active",    mfa: false, joinedAt: "Apr 18, 2025", lastSeen: "1 hr ago",   groups: ["Marketing"],                   apps: ["NutraCRM", "MediaManager"],             sessions: 1 },
};

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  pending:   "bg-amber-50 text-amber-700",
};

const ROLE_STYLES: Record<string, string> = {
  Admin:     "bg-indigo-50 text-indigo-700",
  Moderator: "bg-violet-50 text-violet-700",
  Member:    "bg-slate-100 text-slate-600",
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { orgSlug, userId } = await params;

  const user = MOCK_USER_MAP[userId] ?? {
    name: `User ${userId}`,
    email: `user-${userId}@nutracorp.test`,
    role: "Member",
    status: "active" as const,
    mfa: false,
    joinedAt: "Unknown",
    lastSeen: "Unknown",
    groups: [],
    apps: [],
    sessions: 0,
  };

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — user detail view is open to all authenticated users. Edit/suspend actions will be role-gated before GA.
      </PreviewBanner>

      {/* Back link */}
      <Link
        href={`/org/${orgSlug}/users`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      {/* Profile header */}
      <div className="flex items-start justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              {user.name}
              {user.mfa && <BadgeCheck className="h-4 w-4 text-indigo-500" aria-label="MFA verified" />}
            </h1>
            <p className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                {user.role}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[user.status]}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            Suspend
          </button>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Account details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <User className="h-4 w-4 text-indigo-500" />
            Account Details
          </h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">User ID</dt>
              <dd className="font-mono text-xs text-slate-700">{userId}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Joined</dt>
              <dd className="flex items-center gap-1.5 text-slate-700">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                {user.joinedAt}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Last Seen</dt>
              <dd className="text-slate-700">{user.lastSeen}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">MFA</dt>
              <dd className={`font-semibold ${user.mfa ? "text-emerald-600" : "text-slate-400"}`}>
                {user.mfa ? "Enabled" : "Not set up"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Groups */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <UsersRound className="h-4 w-4 text-indigo-500" />
            Groups
          </h2>
          {user.groups.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Not assigned to any groups.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {user.groups.map((g) => (
                <li key={g} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700">
                  <UsersRound className="h-3.5 w-3.5 text-slate-400" />
                  {g}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Access summary */}
        <div className="flex flex-col gap-5">
          {/* Applications */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <KeyRound className="h-4 w-4 text-indigo-500" />
              Assigned Applications
            </h2>
            {user.apps.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No app access assigned.</p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {user.apps.map((app) => (
                  <li key={app} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    {app}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Active sessions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MonitorSmartphone className="h-4 w-4 text-indigo-500" />
              Active Sessions
            </h2>
            <p className="mt-3 text-3xl font-bold text-slate-900">{user.sessions}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {user.sessions === 0 ? "No active sessions" : `session${user.sessions > 1 ? "s" : ""} currently open`}
            </p>
            {user.sessions > 0 && (
              <button type="button" className="mt-3 text-xs font-medium text-red-600 hover:text-red-500">
                Revoke all sessions
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          Effective Permissions
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Permissions are inherited from this user&apos;s role and group memberships.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["read:users", "read:groups", "read:applications",
            ...(user.role === "Admin" ? ["write:users", "write:groups", "manage:policies", "manage:roles"] : []),
            ...(user.role === "Moderator" ? ["write:users", "read:policies"] : []),
          ].map((perm) => (
            <span
              key={perm}
              className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-mono text-[11px] text-indigo-700"
            >
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, CalendarDays, KeyRound,
  Mail, MonitorSmartphone, ShieldCheck, User, UsersRound,
} from "lucide-react";
import {
  Banner, Button, Avatar, Badge,
  StatusBadge, RoleBadge,
  Card, CardHeader, CardBody,
  EmptyState,
} from "@/components/ui";

interface UserDetailPageProps {
  params: Promise<{ orgSlug: string; userId: string }>;
}

const MOCK_USER_MAP: Record<string, {
  name: string; email: string; role: string;
  status: "active" | "suspended" | "pending";
  mfa: boolean; joinedAt: string; lastSeen: string;
  groups: string[]; apps: string[]; sessions: number;
}> = {
  u001: { name: "Alice Wright",   email: "alice.w@nutracorp.test",   role: "Admin",     status: "active",    mfa: true,  joinedAt: "Jan 12, 2025", lastSeen: "2 min ago", groups: ["Engineering","Leadership"],  apps: ["NutraCRM","SecurePass","WorkflowPro"], sessions: 3 },
  u002: { name: "Bob Keller",     email: "bob.k@nutracorp.test",     role: "Moderator", status: "suspended", mfa: true,  joinedAt: "Mar 05, 2025", lastSeen: "3 hr ago",  groups: ["Support"],                   apps: ["NutraCRM"],                            sessions: 0 },
  u003: { name: "Charlie Nguyen", email: "charlie.n@nutracorp.test", role: "Member",    status: "active",    mfa: false, joinedAt: "Apr 18, 2025", lastSeen: "1 hr ago",  groups: ["Marketing"],                 apps: ["NutraCRM","MediaManager"],             sessions: 1 },
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { orgSlug, userId } = await params;

  const user = MOCK_USER_MAP[userId] ?? {
    name: `User ${userId}`, email: `user-${userId}@nutracorp.test`,
    role: "Member", status: "active" as const,
    mfa: false, joinedAt: "Unknown", lastSeen: "Unknown",
    groups: [], apps: [], sessions: 0,
  };

  const effectivePerms = [
    "read:users", "read:groups", "read:applications",
    ...(user.role === "Admin"     ? ["write:users","write:groups","manage:policies","manage:roles"] : []),
    ...(user.role === "Moderator" ? ["write:users","read:policies"] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — edit/suspend actions will be role-gated before GA.
      </Banner>

      <Link href={`/org/${orgSlug}/users`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to users
      </Link>

      {/* Profile header */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size="2xl" status={user.status === "active" ? "online" : "offline"} />
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  {user.name}
                  {user.mfa && <BadgeCheck className="h-4 w-4 text-indigo-500" aria-label="MFA verified" />}
                </h1>
                <p className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500">
                  <Mail className="h-3.5 w-3.5" />{user.email}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} dot />
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary">Edit</Button>
              <Button variant="danger">Suspend</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Account details */}
        <Card>
          <CardHeader title="Account Details" icon={<User className="h-4 w-4 text-indigo-500" />} />
          <CardBody>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                { label: "User ID",   value: <code className="font-mono text-xs text-slate-700">{userId}</code> },
                { label: "Joined",    value: <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{user.joinedAt}</span> },
                { label: "Last Seen", value: user.lastSeen },
                { label: "MFA",       value: <Badge variant={user.mfa ? "success" : "muted"} size="xs">{user.mfa ? "Enabled" : "Not set up"}</Badge> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader title="Groups" icon={<UsersRound className="h-4 w-4 text-indigo-500" />} />
          <CardBody>
            {user.groups.length === 0 ? (
              <EmptyState icon={UsersRound} title="No groups" compact />
            ) : (
              <ul className="flex flex-col gap-2">
                {user.groups.map(g => (
                  <li key={g} className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2">
                    <Avatar name={g} size="xs" />
                    <span className="text-sm text-slate-700">{g}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Assigned Applications" icon={<KeyRound className="h-4 w-4 text-indigo-500" />} />
            <CardBody>
              {user.apps.length === 0 ? (
                <EmptyState icon={KeyRound} title="No apps" compact />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.apps.map(app => <Badge key={app} variant="muted">{app}</Badge>)}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Active Sessions" icon={<MonitorSmartphone className="h-4 w-4 text-indigo-500" />} />
            <CardBody>
              <p className="text-3xl font-bold text-slate-900">{user.sessions}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {user.sessions === 0 ? "No active sessions" : `session${user.sessions > 1 ? "s" : ""} currently open`}
              </p>
              {user.sessions > 0 && (
                <Button variant="danger" size="xs" className="mt-3">Revoke all sessions</Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader
          title="Effective Permissions"
          icon={<ShieldCheck className="h-4 w-4 text-indigo-500" />}
          description="Inherited from this user's role and group memberships."
        />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {effectivePerms.map(perm => (
              <code key={perm} className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-mono text-[11px] text-indigo-700">
                {perm}
              </code>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

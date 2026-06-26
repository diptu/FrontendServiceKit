"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, UsersRound, ShieldCheck, AppWindow, Settings,
  UserPlus, Activity, CheckCircle, Trash2, ChevronDown,
} from "lucide-react";
import {
  Banner, Button,
  Avatar, Badge, StatusBadge, StatCard,
  Card, CardHeader, CardBody,
  DataTable, type Column,
  EmptyState,
  Modal,
  Alert,
} from "@/components/ui";

/* ── Types ─────────────────────────────────────────────────────────────── */
type MemberStatus = "active" | "suspended" | "pending";
type GroupStatus  = "active" | "inactive";

interface GroupMember {
  id: string; name: string; email: string;
  role: string; status: MemberStatus; joinedAt: string;
}

interface GroupDetail {
  id: string; name: string; description: string; status: GroupStatus;
  createdAt: string; createdBy: string;
  members: GroupMember[]; roles: string[]; apps: string[];
  recentActivity: { message: string; time: string; kind: "success" | "info" | "warning" }[];
}

/* ── Mock data ─────────────────────────────────────────────────────────── */
const GROUP_DATA: Record<string, GroupDetail> = {
  g1: {
    id: "g1", name: "Engineering", description: "Core product and infra teams",
    status: "active", createdAt: "Jan 5, 2025", createdBy: "Sarah Mitchell",
    members: [
      { id: "m1", name: "Alice Wright",   email: "alice.w@nutracorp.test",   role: "Admin",     status: "active",    joinedAt: "Jan 12, 2025" },
      { id: "m2", name: "Bob Keller",     email: "bob.k@nutracorp.test",     role: "Developer", status: "suspended", joinedAt: "Feb 3, 2025"  },
      { id: "m3", name: "Charlie Nguyen", email: "charlie.n@nutracorp.test", role: "Developer", status: "active",    joinedAt: "Mar 18, 2025" },
      { id: "m4", name: "Dana Osei",      email: "dana.o@nutracorp.test",    role: "Developer", status: "active",    joinedAt: "Apr 2, 2025"  },
      { id: "m5", name: "Evan Marsh",     email: "evan.m@nutracorp.test",    role: "Developer", status: "pending",   joinedAt: "Jun 10, 2025" },
    ],
    roles: ["Admin", "Developer"],
    apps: ["NutraCRM", "SecurePass", "WorkflowPro", "DataVault"],
    recentActivity: [
      { message: "Evan Marsh added to group",                time: "2 hr ago",   kind: "success" },
      { message: "WorkflowPro access granted to group",      time: "1 day ago",  kind: "info"    },
      { message: "Bob Keller suspended",                     time: "2 days ago", kind: "warning" },
      { message: "Group description updated by Alice Wright",time: "5 days ago", kind: "info"    },
    ],
  },
  g2: {
    id: "g2", name: "Marketing", description: "Growth, content, and brand teams",
    status: "active", createdAt: "Feb 10, 2025", createdBy: "James Chen",
    members: [
      { id: "m6", name: "Fatima Reyes", email: "fatima.r@nutracorp.test", role: "Moderator", status: "active", joinedAt: "Feb 12, 2025" },
      { id: "m7", name: "George Lin",   email: "george.l@nutracorp.test", role: "Viewer",    status: "active", joinedAt: "Mar 1, 2025"  },
      { id: "m8", name: "Hana Popov",   email: "hana.p@nutracorp.test",   role: "Viewer",    status: "active", joinedAt: "Mar 15, 2025" },
    ],
    roles: ["Viewer", "Moderator"],
    apps: ["NutraCRM", "MediaManager", "AnalyticsHub"],
    recentActivity: [
      { message: "AnalyticsHub access granted to group", time: "3 hr ago",   kind: "success" },
      { message: "Hana Popov added to group",            time: "3 days ago", kind: "success" },
    ],
  },
  g3: {
    id: "g3", name: "Leadership", description: "Executives and org-level stakeholders",
    status: "active", createdAt: "Jan 1, 2025", createdBy: "Sarah Mitchell",
    members: [
      { id: "m9",  name: "Sarah Mitchell", email: "sarah.m@nutracorp.test", role: "Super Admin", status: "active", joinedAt: "Jan 1, 2025" },
      { id: "m10", name: "James Chen",     email: "james.c@nutracorp.test", role: "Admin",       status: "active", joinedAt: "Jan 5, 2025" },
    ],
    roles: ["Super Admin", "Admin"],
    apps: ["NutraCRM", "SecurePass", "WorkflowPro", "MediaManager", "DataVault", "AnalyticsHub"],
    recentActivity: [
      { message: "James Chen joined Leadership group", time: "5 months ago", kind: "success" },
    ],
  },
  g4: {
    id: "g4", name: "Support", description: "Customer-facing support agents",
    status: "active", createdAt: "Mar 1, 2025", createdBy: "James Chen",
    members: [
      { id: "m11", name: "Fatima Reyes", email: "fatima.r@nutracorp.test", role: "Support Agent", status: "active", joinedAt: "Mar 3, 2025"  },
      { id: "m12", name: "George Lin",   email: "george.l@nutracorp.test", role: "Support Agent", status: "active", joinedAt: "Mar 10, 2025" },
    ],
    roles: ["Support Agent"],
    apps: ["NutraCRM", "SecurePass"],
    recentActivity: [
      { message: "George Lin added to group",          time: "3 months ago", kind: "success" },
      { message: "SecurePass access granted to group", time: "4 months ago", kind: "info"    },
    ],
  },
  g5: {
    id: "g5", name: "Finance", description: "Billing, payroll, and procurement",
    status: "active", createdAt: "Feb 1, 2025", createdBy: "Sarah Mitchell",
    members: [
      { id: "m13", name: "Hana Popov", email: "hana.p@nutracorp.test", role: "Viewer", status: "active", joinedAt: "Feb 5, 2025" },
    ],
    roles: ["Viewer"],
    apps: ["NutraCRM", "DataVault"],
    recentActivity: [
      { message: "DataVault access granted to group", time: "4 months ago", kind: "info" },
    ],
  },
  g6: {
    id: "g6", name: "Design", description: "Product design and brand identity",
    status: "active", createdAt: "Apr 1, 2025", createdBy: "James Chen",
    members: [
      { id: "m14", name: "Charlie Nguyen", email: "charlie.n@nutracorp.test", role: "Developer", status: "active", joinedAt: "Apr 5, 2025"  },
      { id: "m15", name: "Dana Osei",      email: "dana.o@nutracorp.test",    role: "Viewer",    status: "active", joinedAt: "Apr 10, 2025" },
    ],
    roles: ["Developer", "Viewer"],
    apps: ["NutraCRM", "MediaManager"],
    recentActivity: [
      { message: "MediaManager access granted to group", time: "2 months ago", kind: "info" },
    ],
  },
  g7: {
    id: "g7", name: "Contractors", description: "External partners and consultants",
    status: "inactive", createdAt: "May 1, 2025", createdBy: "James Chen",
    members: [
      { id: "m16", name: "Evan Marsh", email: "evan.m@nutracorp.test", role: "Viewer", status: "pending", joinedAt: "May 5, 2025" },
    ],
    roles: ["Viewer"],
    apps: ["WorkflowPro"],
    recentActivity: [
      { message: "Group marked inactive", time: "1 month ago", kind: "warning" },
    ],
  },
};

const INVITABLE_USERS = [
  { id: "u-new1", name: "Lena Torres",  email: "lena.t@nutracorp.test"  },
  { id: "u-new2", name: "Marco Silva",  email: "marco.s@nutracorp.test" },
  { id: "u-new3", name: "Nina Okafor",  email: "nina.o@nutracorp.test"  },
  { id: "u-new4", name: "Omar Hassan",  email: "omar.h@nutracorp.test"  },
  { id: "u-new5", name: "Priya Patel",  email: "priya.p@nutracorp.test" },
];

const ALL_ROLES = ["Admin", "Moderator", "Developer", "Support Agent", "Viewer"];

const KIND_DOT: Record<string, string> = {
  success: "bg-emerald-500",
  info:    "bg-blue-500",
  warning: "bg-amber-400",
};

/* ── Settings Modal ─────────────────────────────────────────────────────── */
function SettingsModal({ group, open, onClose, onSave }: {
  group: GroupDetail; open: boolean; onClose: () => void;
  onSave: (name: string, description: string, status: GroupStatus) => void;
}) {
  const [name, setName]       = useState(group.name);
  const [description, setDesc]= useState(group.description);
  const [status, setStatus]   = useState<GroupStatus>(group.status);
  const [saved, setSaved]     = useState(false);
  const [errors, setErrors]   = useState<{ name?: string }>({});

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErrors({ name: "Group name is required." }); return; }
    onSave(name.trim(), description.trim(), status);
    setSaved(true);
  }

  function handleClose() { setSaved(false); setErrors({}); onClose(); }

  if (saved) {
    return (
      <Modal open={open} onClose={handleClose} title="Settings Saved" size="sm"
        footer={<Button onClick={handleClose} fullWidth>Done</Button>}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">Group settings have been updated successfully.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}
      title="Group Settings"
      description={`Update configuration for ${group.name}`}
      footer={<><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button icon={Settings} type="submit" form="group-settings-form">Save Settings</Button></>}
    >
      <form id="group-settings-form" onSubmit={handleSave} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Group Name <span className="text-red-500">*</span></label>
          <input type="text" value={name}
            onChange={e => { setName(e.target.value); setErrors({}); }}
            className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Description</label>
          <textarea rows={3} value={description} onChange={e => setDesc(e.target.value)}
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Status</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(["active", "inactive"] as GroupStatus[]).map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  status === s
                    ? s === "active" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-400 bg-slate-100 text-slate-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-900">Danger Zone</p>
          <p className="mt-0.5 text-[11px] text-red-600">Deleting this group is permanent and cannot be undone.</p>
          <Button variant="danger" size="xs" icon={Trash2} className="mt-3">Delete Group</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Add Member Modal ───────────────────────────────────────────────────── */
function AddMemberModal({ existingIds, groupRoles, open, onClose, onAdd }: {
  existingIds: string[]; groupRoles: string[];
  open: boolean; onClose: () => void; onAdd: (member: GroupMember) => void;
}) {
  const available = INVITABLE_USERS.filter(u => !existingIds.includes(u.id));
  const rolePool  = groupRoles.length > 0 ? groupRoles : ALL_ROLES;

  const [userId, setUserId]       = useState("");
  const [role, setRole]           = useState(rolePool[0] ?? "Viewer");
  const [errors, setErrors]       = useState<{ user?: string }>({});
  const [added, setAdded]         = useState(false);
  const [addedName, setAddedName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setErrors({ user: "Please select a user." }); return; }
    const user = available.find(u => u.id === userId)!;
    onAdd({ id: user.id, name: user.name, email: user.email, role, status: "active", joinedAt: "just now" });
    setAddedName(user.name);
    setAdded(true);
  }

  function handleClose() { setUserId(""); setErrors({}); setAdded(false); setAddedName(""); onClose(); }

  if (added) {
    return (
      <Modal open={open} onClose={handleClose} title="Member Added" size="sm"
        footer={<Button onClick={handleClose} fullWidth>Done</Button>}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{addedName}</span> has been added as <span className="font-semibold text-slate-700">{role}</span>.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}
      title="Add Member"
      description="Invite an existing org user to this group"
      footer={<><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button icon={UserPlus} type="submit" form="add-member-form" disabled={available.length === 0}>Add Member</Button></>}
    >
      <form id="add-member-form" onSubmit={handleAdd} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700">User <span className="text-red-500">*</span></label>
          {available.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">All available users are already in this group.</p>
          ) : (
            <>
              <div className="relative mt-1.5">
                <select value={userId}
                  onChange={e => { setUserId(e.target.value); setErrors({}); }}
                  className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.user ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}>
                  <option value="">Select a user…</option>
                  {available.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.user && <p className="mt-1 text-[11px] text-red-600">{errors.user}</p>}
            </>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Role in Group</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rolePool.map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  role === r ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                }`}>{r}
              </button>
            ))}
          </div>
        </div>

        <Alert variant="info" compact>
          The user will inherit all permissions associated with the <strong>{role}</strong> role in this group.
        </Alert>
      </form>
    </Modal>
  );
}

/* ── Member table columns ───────────────────────────────────────────────── */
function memberColumns(orgSlug: string): Column<GroupMember>[] {
  return [
    {
      key: "name", header: "Member",
      render: m => (
        <div className="flex items-center gap-2.5">
          <Avatar name={m.name} size="xs" />
          <div>
            <p className="text-xs font-medium text-slate-900">{m.name}</p>
            <p className="text-[11px] text-slate-400">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "Role",
      render: m => <Badge variant="muted" size="xs">{m.role}</Badge>,
    },
    {
      key: "status", header: "Status",
      render: m => <StatusBadge status={m.status} dot />,
    },
    {
      key: "joinedAt", header: "Joined",
      className: "text-xs text-slate-500",
    },
    {
      key: "actions", header: "", align: "right" as const,
      render: m => (
        <Link href={`/org/${orgSlug}/users/${m.id}`}>
          <Button variant="ghost" size="xs">View →</Button>
        </Link>
      ),
    },
  ];
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function GroupDetailPage({ params }: { params: Promise<{ orgSlug: string; groupId: string }> }) {
  const { orgSlug, groupId } = use(params);

  const seed = GROUP_DATA[groupId] ?? {
    id: groupId, name: `Group ${groupId}`, description: "No description available.",
    status: "active" as GroupStatus, createdAt: "Unknown", createdBy: "Unknown",
    members: [], roles: [], apps: [], recentActivity: [],
  };

  const [group, setGroup]             = useState<GroupDetail>(seed);
  const [showSettings, setSettings]   = useState(false);
  const [showAddMember, setAddMember] = useState(false);

  const activeCount    = group.members.filter(m => m.status === "active").length;
  const suspendedCount = group.members.filter(m => m.status === "suspended").length;
  const pendingCount   = group.members.filter(m => m.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — changes are local only and reset on page refresh.
      </Banner>

      <Link href={`/org/${orgSlug}/groups`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to groups
      </Link>

      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={group.name} size="xl" />
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-slate-900">{group.name}</h1>
                  <StatusBadge status={group.status} dot />
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{group.description}</p>
                <p className="mt-1.5 text-xs text-slate-400">
                  Created {group.createdAt} by <span className="font-medium text-slate-600">{group.createdBy}</span>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" icon={Settings} onClick={() => setSettings(true)}>Settings</Button>
              <Button icon={UserPlus} onClick={() => setAddMember(true)}>Add Member</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={UsersRound} label="Total Members" value={group.members.length} color="indigo"  />
        <StatCard icon={UsersRound} label="Active"        value={activeCount}          color="emerald" />
        <StatCard icon={UsersRound} label="Pending"       value={pendingCount}         color="amber"   />
        <StatCard icon={UsersRound} label="Suspended"     value={suspendedCount}       color="rose"    />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Members table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Members"
              icon={<UsersRound className="h-4 w-4 text-indigo-500" />}
              action={<Button size="xs" icon={UserPlus} onClick={() => setAddMember(true)}>Add</Button>}
            />
            <DataTable<GroupMember>
              columns={memberColumns(orgSlug)}
              data={group.members}
              rowKey={m => m.id}
              emptyState={
                <EmptyState icon={UsersRound} title="No members yet"
                  action={<Button icon={UserPlus} size="xs" onClick={() => setAddMember(true)}>Add First Member</Button>}
                  compact
                />
              }
            />
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Assigned Roles" icon={<ShieldCheck className="h-4 w-4 text-indigo-500" />} />
            <CardBody>
              {group.roles.length === 0 ? (
                <p className="text-xs text-slate-400">No roles assigned.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {group.roles.map(r => <Badge key={r} variant="muted">{r}</Badge>)}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Application Access" icon={<AppWindow className="h-4 w-4 text-indigo-500" />} />
            <CardBody>
              {group.apps.length === 0 ? (
                <EmptyState icon={AppWindow} title="No apps assigned" compact />
              ) : (
                <ul className="flex flex-col gap-2">
                  {group.apps.map(app => (
                    <li key={app} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <Avatar name={app} size="xs" />
                      <span className="text-xs font-medium text-slate-700">{app}</span>
                      <Badge variant="success" size="xs" className="ml-auto">Active</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" icon={<Activity className="h-4 w-4 text-indigo-500" />} />
            <CardBody>
              {group.recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400">No recent activity.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {group.recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_DOT[a.kind]}`} />
                      <div>
                        <p className="text-xs text-slate-700">{a.message}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <SettingsModal
        open={showSettings}
        group={group}
        onClose={() => setSettings(false)}
        onSave={(name, description, status) => {
          setGroup(prev => ({ ...prev, name, description, status }));
        }}
      />
      <AddMemberModal
        open={showAddMember}
        existingIds={group.members.map(m => m.id)}
        groupRoles={group.roles}
        onClose={() => setAddMember(false)}
        onAdd={member => setGroup(prev => ({
          ...prev,
          members: [...prev.members, member],
          recentActivity: [{ message: `${member.name} added to group`, time: "just now", kind: "success" }, ...prev.recentActivity],
        }))}
      />
    </div>
  );
}

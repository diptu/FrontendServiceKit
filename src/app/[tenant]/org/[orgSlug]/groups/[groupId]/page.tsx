"use client";

import { use, useState } from "react";
import Link from "next/link";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import {
  ArrowLeft, UsersRound, ShieldCheck, AppWindow, Settings,
  UserPlus, Activity, X, ChevronDown, CheckCircle, Trash2,
} from "lucide-react";

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

// Pool of users that can be invited (not already members in any group shown here)
const INVITABLE_USERS = [
  { id: "u-new1", name: "Lena Torres",   email: "lena.t@nutracorp.test"   },
  { id: "u-new2", name: "Marco Silva",   email: "marco.s@nutracorp.test"  },
  { id: "u-new3", name: "Nina Okafor",   email: "nina.o@nutracorp.test"   },
  { id: "u-new4", name: "Omar Hassan",   email: "omar.h@nutracorp.test"   },
  { id: "u-new5", name: "Priya Patel",   email: "priya.p@nutracorp.test"  },
];

const ALL_ROLES = ["Admin", "Moderator", "Developer", "Support Agent", "Viewer"];

/* ── Style maps ────────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  pending:   "bg-amber-50 text-amber-700",
  inactive:  "bg-slate-100 text-slate-500",
};
const ROLE_STYLES: Record<string, string> = {
  "Super Admin":   "bg-red-50 text-red-700",
  Admin:           "bg-violet-50 text-violet-700",
  Moderator:       "bg-indigo-50 text-indigo-700",
  Developer:       "bg-sky-50 text-sky-700",
  "Support Agent": "bg-amber-50 text-amber-700",
  Viewer:          "bg-slate-100 text-slate-600",
};
const KIND_DOT: Record<string, string> = {
  success: "bg-emerald-500",
  info:    "bg-blue-500",
  warning: "bg-amber-400",
};

/* ── Settings Modal ────────────────────────────────────────────────────── */
interface SettingsModalProps {
  group: GroupDetail;
  onClose: () => void;
  onSave: (name: string, description: string, status: GroupStatus) => void;
}

function SettingsModal({ group, onClose, onSave }: SettingsModalProps) {
  const [name, setName]           = useState(group.name);
  const [description, setDesc]    = useState(group.description);
  const [status, setStatus]       = useState<GroupStatus>(group.status);
  const [saved, setSaved]         = useState(false);
  const [errors, setErrors]       = useState<{ name?: string }>({});

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErrors({ name: "Group name is required." }); return; }
    onSave(name.trim(), description.trim(), status);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Settings Saved</h2>
          <p className="mt-1 text-sm text-slate-500">Group settings have been updated successfully.</p>
          <button onClick={onClose} className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Group Settings</h2>
            <p className="mt-0.5 text-xs text-slate-400">Update configuration for <span className="font-medium">{group.name}</span></p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 px-6 py-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors({}); }}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDesc(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Status</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["active", "inactive"] as GroupStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                    status === s
                      ? s === "active"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-400 bg-slate-100 text-slate-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
              <Settings className="h-4 w-4" />Save Settings
            </button>
          </div>

          {/* Danger zone */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-900">Danger Zone</p>
            <p className="mt-0.5 text-[11px] text-red-600">Deleting this group is permanent and cannot be undone.</p>
            <button
              type="button"
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />Delete Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Add Member Modal ──────────────────────────────────────────────────── */
interface AddMemberModalProps {
  existingIds: string[];
  groupRoles: string[];
  onClose: () => void;
  onAdd: (member: GroupMember) => void;
}

function AddMemberModal({ existingIds, groupRoles, onClose, onAdd }: AddMemberModalProps) {
  const available  = INVITABLE_USERS.filter(u => !existingIds.includes(u.id));
  const rolePool   = groupRoles.length > 0 ? groupRoles : ALL_ROLES;

  const [userId, setUserId]   = useState("");
  const [role, setRole]       = useState(rolePool[0] ?? "Viewer");
  const [errors, setErrors]   = useState<{ user?: string }>({});
  const [added, setAdded]     = useState(false);
  const [addedName, setAddedName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setErrors({ user: "Please select a user." }); return; }

    const user = available.find(u => u.id === userId)!;
    const member: GroupMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      status: "active",
      joinedAt: "just now",
    };
    onAdd(member);
    setAddedName(user.name);
    setAdded(true);
  }

  if (added) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Member Added</h2>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{addedName}</span> has been added to the group as <span className="font-semibold text-slate-700">{role}</span>.
          </p>
          <button onClick={onClose} className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Member</h2>
            <p className="mt-0.5 text-xs text-slate-400">Invite an existing org user to this group</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-5 px-6 py-5">
          {/* User picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              User <span className="text-red-500">*</span>
            </label>
            {available.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">All available users are already in this group.</p>
            ) : (
              <>
                <div className="relative mt-1.5">
                  <select
                    value={userId}
                    onChange={e => { setUserId(e.target.value); setErrors({}); }}
                    className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.user ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
                  >
                    <option value="">Select a user…</option>
                    {available.map(u => (
                      <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.user && <p className="mt-1 text-[11px] text-red-600">{errors.user}</p>}
              </>
            )}
          </div>

          {/* Role picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Role in Group</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {rolePool.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    role === r
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
            The user will inherit all permissions associated with the <span className="font-semibold">{role}</span> role in this group.
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={available.length === 0}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function GroupDetailPage({ params }: { params: Promise<{ orgSlug: string; groupId: string }> }) {
  const { orgSlug, groupId } = use(params);

  const seed = GROUP_DATA[groupId] ?? {
    id: groupId, name: `Group ${groupId}`, description: "No description available.",
    status: "active" as GroupStatus, createdAt: "Unknown", createdBy: "Unknown",
    members: [], roles: [], apps: [], recentActivity: [],
  };

  const [group, setGroup]           = useState<GroupDetail>(seed);
  const [showSettings, setSettings] = useState(false);
  const [showAddMember, setAddMember] = useState(false);

  const activeCount    = group.members.filter(m => m.status === "active").length;
  const suspendedCount = group.members.filter(m => m.status === "suspended").length;
  const pendingCount   = group.members.filter(m => m.status === "pending").length;

  function handleSettingsSave(name: string, description: string, status: GroupStatus) {
    setGroup(prev => ({ ...prev, name, description, status }));
  }

  function handleAddMember(member: GroupMember) {
    setGroup(prev => ({
      ...prev,
      members: [...prev.members, member],
      recentActivity: [
        { message: `${member.name} added to group`, time: "just now", kind: "success" },
        ...prev.recentActivity,
      ],
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — changes are local only and reset on page refresh.
      </PreviewBanner>

      <Link href={`/org/${orgSlug}/groups`} className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to groups
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            {group.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{group.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[group.status]}`}>
                {group.status}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{group.description}</p>
            <p className="mt-1.5 text-xs text-slate-400">
              Created {group.createdAt} by <span className="font-medium text-slate-600">{group.createdBy}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setSettings(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4" />Settings
          </button>
          <button
            type="button"
            onClick={() => setAddMember(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" />Add Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Members", value: group.members.length, color: "text-slate-900"   },
          { label: "Active",        value: activeCount,          color: "text-emerald-600" },
          { label: "Pending",       value: pendingCount,         color: "text-amber-600"   },
          { label: "Suspended",     value: suspendedCount,       color: "text-red-600"     },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Members table */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <UsersRound className="h-4 w-4 text-indigo-500" />Members
            </h2>
            <button
              type="button"
              onClick={() => setAddMember(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />Add
            </button>
          </div>

          {group.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
              <UsersRound className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No members yet</p>
              <button
                type="button"
                onClick={() => setAddMember(true)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />Add First Member
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Member</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">Joined</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {group.members.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLES[m.role] ?? "bg-slate-100 text-slate-600"}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{m.joinedAt}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/org/${orgSlug}/users/${m.id}`} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Roles */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />Assigned Roles
            </h2>
            {group.roles.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">No roles assigned.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {group.roles.map(r => (
                  <span key={r} className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLES[r] ?? "bg-slate-100 text-slate-600"}`}>
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Apps */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <AppWindow className="h-4 w-4 text-indigo-500" />Application Access
            </h2>
            {group.apps.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">No apps assigned.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {group.apps.map(app => (
                  <li key={app} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700">
                      {app[0]}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{app}</span>
                    <span className="ml-auto rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">Active</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity className="h-4 w-4 text-indigo-500" />Recent Activity
            </h2>
            {group.recentActivity.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">No recent activity.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
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
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          group={group}
          onClose={() => setSettings(false)}
          onSave={(name, description, status) => { handleSettingsSave(name, description, status); }}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          existingIds={group.members.map(m => m.id)}
          groupRoles={group.roles}
          onClose={() => setAddMember(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}

"use client";

import { use, useState } from "react";
import Link from "next/link";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { UsersRound, Plus, Search, X, CheckCircle, Check } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */
type GroupStatus = "active" | "inactive";

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  roles: string[];
  status: GroupStatus;
}

/* ── Seed data ─────────────────────────────────────────────────────────── */
const SEED_GROUPS: Group[] = [
  { id: "g1", name: "Engineering",  description: "Core product and infra teams",         members: 45, roles: ["Developer", "Admin"],   status: "active"   },
  { id: "g2", name: "Marketing",    description: "Growth, content, and brand teams",      members: 23, roles: ["Viewer", "Moderator"],  status: "active"   },
  { id: "g3", name: "Leadership",   description: "Executives and org-level stakeholders", members: 8,  roles: ["Super Admin", "Admin"], status: "active"   },
  { id: "g4", name: "Support",      description: "Customer-facing support agents",        members: 31, roles: ["Support Agent"],         status: "active"   },
  { id: "g5", name: "Finance",      description: "Billing, payroll, and procurement",     members: 12, roles: ["Viewer"],                status: "active"   },
  { id: "g6", name: "Design",       description: "Product design and brand identity",     members: 18, roles: ["Developer", "Viewer"],  status: "active"   },
  { id: "g7", name: "Contractors",  description: "External partners and consultants",     members: 9,  roles: ["Viewer"],                status: "inactive" },
];

const ALL_ROLES = ["Super Admin", "Admin", "Moderator", "Developer", "Support Agent", "Viewer"];

const ROLE_COLORS: Record<string, string> = {
  "Super Admin":   "bg-red-50 text-red-700 border-red-200",
  Admin:           "bg-violet-50 text-violet-700 border-violet-200",
  Moderator:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  Developer:       "bg-sky-50 text-sky-700 border-sky-200",
  "Support Agent": "bg-amber-50 text-amber-700 border-amber-200",
  Viewer:          "bg-slate-100 text-slate-600 border-slate-200",
};

/* ── Create Group Modal ────────────────────────────────────────────────── */
interface CreateGroupModalProps {
  onClose: () => void;
  onSubmit: (group: Group) => void;
}

function CreateGroupModal({ onClose, onSubmit }: CreateGroupModalProps) {
  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [selectedRoles, setRoles] = useState<string[]>([]);
  const [status, setStatus]       = useState<GroupStatus>("active");
  const [errors, setErrors]       = useState<{ name?: string; roles?: string }>({});
  const [created, setCreated]     = useState<Group | null>(null);

  function toggleRole(role: string) {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    setErrors(prev => ({ ...prev, roles: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!name.trim())               e.name  = "Group name is required.";
    if (selectedRoles.length === 0) e.roles = "Select at least one role.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newGroup: Group = {
      id:          `g-${Date.now()}`,
      name:        name.trim(),
      description: description.trim() || "No description provided.",
      members:     0,
      roles:       selectedRoles,
      status,
    };
    onSubmit(newGroup);
    setCreated(newGroup);
  }

  /* Success screen */
  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Group Created</h2>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{created.name}</span> has been added to your organisation.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Group</h2>
            <p className="mt-0.5 text-xs text-slate-400">Groups bundle users and assign shared roles &amp; app access.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
              placeholder="e.g. QA Engineers"
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? "border-red-400 bg-red-50" : "border-slate-200"
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="What does this group do?"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Roles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Assigned Roles <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-[11px] text-slate-400">All members of this group inherit the selected roles.</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_ROLES.map(role => {
                const active = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors text-left ${
                      active
                        ? `${ROLE_COLORS[role]} ring-1 ring-inset ring-current`
                        : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      active ? "border-current bg-current/10" : "border-slate-300"
                    }`}>
                      {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    {role}
                  </button>
                );
              })}
            </div>
            {errors.roles && <p className="mt-1.5 text-[11px] text-red-600">{errors.roles}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Initial Status</label>
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

          {/* Info */}
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
            You can add members and configure application access after the group is created.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4" />Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function GroupsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = use(params);
  const display = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const [groups, setGroups]   = useState<Group[]>(SEED_GROUPS);
  const [showModal, setModal] = useState(false);
  const [search, setSearch]   = useState("");

  const visible = groups.filter(g =>
    !search ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — group management is local only until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <UsersRound className="h-5 w-5 text-indigo-500" />Groups
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All groups in <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />New Group
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search groups…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Group</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Members</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Roles</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                  No groups match your search.
                </td>
              </tr>
            ) : (
              visible.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                        {g.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{g.name}</p>
                        <p className="text-xs text-slate-400">{g.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{g.members} members</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {g.roles.map(r => (
                        <span key={r} className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      g.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/org/${orgSlug}/groups/${g.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">Showing {visible.length} of {groups.length} groups</p>
        </div>
      </div>

      {showModal && (
        <CreateGroupModal
          onClose={() => setModal(false)}
          onSubmit={group => setGroups(prev => [group, ...prev])}
        />
      )}
    </div>
  );
}

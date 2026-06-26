"use client";

import { use, useState } from "react";
import Link from "next/link";
import { UsersRound, Plus, CheckCircle, Check } from "lucide-react";
import {
  Banner, Button,
  Avatar, Badge, StatusBadge,
  SearchBox,
  Modal,
  Alert,
  DataTable, type Column,
  EmptyState,
} from "@/components/ui";

/* ── Types ─────────────────────────────────────────────────────────────── */
type GroupStatus = "active" | "inactive";

interface Group {
  id: string; name: string; description: string;
  members: number; roles: string[]; status: GroupStatus;
}

/* ── Seed data ──────────────────────────────────────────────────────────── */
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

/* ── Create Group Modal ─────────────────────────────────────────────────── */
function CreateGroupModal({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (group: Group) => void;
}) {
  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [selectedRoles, setRoles] = useState<string[]>([]);
  const [status, setStatus]       = useState<GroupStatus>("active");
  const [errors, setErrors]       = useState<{ name?: string; roles?: string }>({});
  const [created, setCreated]     = useState<Group | null>(null);

  function reset() { setName(""); setDesc(""); setRoles([]); setStatus("active"); setErrors({}); setCreated(null); }

  function toggleRole(role: string) {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    setErrors(prev => ({ ...prev, roles: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim())               errs.name  = "Group name is required.";
    if (selectedRoles.length === 0) errs.roles = "Select at least one role.";
    if (Object.keys(errs).length)   { setErrors(errs); return; }

    const newGroup: Group = {
      id: `g-${Date.now()}`, name: name.trim(),
      description: description.trim() || "No description provided.",
      members: 0, roles: selectedRoles, status,
    };
    onSubmit(newGroup);
    setCreated(newGroup);
  }

  function handleClose() { reset(); onClose(); }

  if (created) {
    return (
      <Modal open={open} onClose={handleClose} title="Group Created" size="sm"
        footer={<Button onClick={handleClose} fullWidth>Done</Button>}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{created.name}</span> has been added to your organisation.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}
      title="Create New Group"
      description="Groups bundle users and assign shared roles & app access."
      footer={<><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button icon={Plus} type="submit" form="create-group-form">Create Group</Button></>}
    >
      <form id="create-group-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Group Name <span className="text-red-500">*</span></label>
          <input type="text" value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
            placeholder="e.g. QA Engineers"
            className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Description</label>
          <textarea rows={2} value={description} onChange={e => setDesc(e.target.value)}
            placeholder="What does this group do?"
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Roles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Assigned Roles <span className="text-red-500">*</span></label>
          <p className="mt-0.5 text-[11px] text-slate-400">All members of this group inherit the selected roles.</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALL_ROLES.map(role => {
              const active = selectedRoles.includes(role);
              return (
                <button key={role} type="button" onClick={() => toggleRole(role)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors text-left ${
                    active ? `${ROLE_COLORS[role]} ring-1 ring-inset ring-current` : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                  }`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${active ? "border-current bg-current/10" : "border-slate-300"}`}>
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

        <Alert variant="info" compact>
          You can add members and configure application access after the group is created.
        </Alert>
      </form>
    </Modal>
  );
}

/* ── Columns ────────────────────────────────────────────────────────────── */
function groupColumns(orgSlug: string): Column<Group>[] {
  return [
    {
      key: "name", header: "Group",
      render: g => (
        <div className="flex items-center gap-3">
          <Avatar name={g.name} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{g.name}</p>
            <p className="text-xs text-slate-400">{g.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "members", header: "Members",
      render: g => <span className="text-slate-700">{g.members} members</span>,
    },
    {
      key: "roles", header: "Roles",
      render: g => (
        <div className="flex flex-wrap gap-1">
          {g.roles.map(r => <Badge key={r} variant="muted" size="xs">{r}</Badge>)}
        </div>
      ),
    },
    {
      key: "status", header: "Status",
      render: g => <StatusBadge status={g.status} dot />,
    },
    {
      key: "actions", header: "", align: "right" as const,
      render: g => (
        <Link href={`/org/${orgSlug}/groups/${g.id}`}>
          <Button variant="secondary" size="xs">View</Button>
        </Link>
      ),
    },
  ];
}

/* ── Page ───────────────────────────────────────────────────────────────── */
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
      <Banner variant="info" showIcon>
        Preview mode — group management is local only until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <UsersRound className="h-5 w-5 text-indigo-500" />Groups
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All groups in <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus} onClick={() => setModal(true)}>New Group</Button>
      </div>

      <SearchBox value={search} onChange={setSearch} placeholder="Search groups…" className="max-w-sm" />

      <DataTable<Group>
        columns={groupColumns(orgSlug)}
        data={visible}
        rowKey={g => g.id}
        emptyState={<EmptyState icon={UsersRound} title="No groups match your search." compact />}
        footer={<p className="text-xs text-slate-500">Showing {visible.length} of {groups.length} groups</p>}
      />

      <CreateGroupModal
        open={showModal}
        onClose={() => setModal(false)}
        onSubmit={group => setGroups(prev => [group, ...prev])}
      />
    </div>
  );
}

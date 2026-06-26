"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Download, Eye } from "lucide-react";
import {
  Banner, Button, IconButton, Avatar,
  StatusBadge, RoleBadge, Badge,
  SearchBox, FilterBar,
  DataTable, TableToolbar,
  Pagination,
  type Column,
} from "@/components/ui";

interface MockUser {
  id:       string;
  name:     string;
  email:    string;
  role:     string;
  status:   "active" | "suspended" | "pending";
  lastSeen: string;
  mfa:      boolean;
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

const STATUS_COUNTS = {
  active:    MOCK_USERS.filter(u => u.status === "active").length,
  suspended: MOCK_USERS.filter(u => u.status === "suspended").length,
  pending:   MOCK_USERS.filter(u => u.status === "pending").length,
};

const COLUMNS: Column<MockUser>[] = [
  {
    key: "name", header: "User",
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar name={u.name} size="sm" />
        <div>
          <p className="font-medium text-slate-900">{u.name}</p>
          <p className="text-xs text-slate-400">{u.email}</p>
        </div>
      </div>
    ),
  },
  { key: "role",     header: "Role",     render: u => <RoleBadge role={u.role} /> },
  { key: "status",   header: "Status",   render: u => <StatusBadge status={u.status} dot /> },
  {
    key: "mfa", header: "MFA",
    render: u => (
      <Badge variant={u.mfa ? "success" : "muted"} size="xs">
        {u.mfa ? "Enabled" : "Off"}
      </Badge>
    ),
  },
  { key: "lastSeen", header: "Last Seen", className: "text-slate-500 text-xs" },
  {
    key: "actions", header: "", align: "right",
    render: u => (
      <Link href={`/org/${u.id}/users/${u.id}`}>
        <IconButton icon={Eye} label="View" size="sm" variant="ghost" />
      </Link>
    ),
  },
];

export default function OrgUsersPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = use(params);
  const displayName = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [page, setPage]             = useState(1);
  const PAGE_SIZE = 10;

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — write actions will be gated by role before GA.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Users className="h-5 w-5 text-indigo-500" />Users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All members of <span className="font-medium text-slate-700">{displayName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Export</Button>
          <Button icon={UserPlus}>Invite User</Button>
        </div>
      </div>

      <FilterBar
        value={statusFilter}
        onChange={setStatus}
        options={[
          { label: "Active",    value: "active",    count: STATUS_COUNTS.active    },
          { label: "Suspended", value: "suspended", count: STATUS_COUNTS.suspended },
          { label: "Pending",   value: "pending",   count: STATUS_COUNTS.pending   },
        ]}
      />

      <TableToolbar
        left={<SearchBox value={search} onChange={setSearch} placeholder="Search users…" />}
        right={<p className="text-xs text-slate-500">Showing {filtered.length} of 1,248 users</p>}
      />

      <DataTable<MockUser>
        columns={COLUMNS}
        data={filtered}
        rowKey={u => u.id}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filter."
        emptyIcon={Users}
      />

      <Pagination
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

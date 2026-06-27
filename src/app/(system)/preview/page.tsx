"use client";

import { useState } from "react";
import {
  ShoppingBag, Users, DollarSign, UtensilsCrossed, Clock,
  Plus, Trash2, Settings, Search, Download, Bell, FileText,
  Package, AlertTriangle, CheckCircle, Info, Shield, UserPlus,
  LayoutDashboard, Lock, Globe, BookOpen, Activity, LogOut, Edit2,
  Eye, Copy, ChevronDown,
} from "lucide-react";
import {
  Badge, StatusBadge, RoleBadge, PlanBadge,
  Button, IconButton,
  Avatar, AvatarGroup,
  Card, CardHeader, CardBody, CardFooter,
  StatCard,
  EmptyState,
  Spinner, LoadingOverlay, SkeletonCard, SkeletonTable, SkeletonStatRow, ProgressBar,
  Alert, Banner,
  ToastPreview,
  Modal, ConfirmationDialog, DeleteDialog,
  SearchBox,
  Pagination,
  DataTable, TableToolbar,
  Tabs, TabPanel,
  Breadcrumb,
  FilterBar, FilterChips,
  Drawer,
  DropdownMenu, KebabMenu,
} from "@/components/ui";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const BATCH_COLORS: Record<number, string> = {
  1: "bg-indigo-100 text-indigo-700",
  2: "bg-violet-100 text-violet-700",
  3: "bg-emerald-100 text-emerald-700",
};

function Section({ title, id, batch, children }: { title: string; id: string; batch: number; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BATCH_COLORS[batch]}`}>B{batch}</span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <div className="flex-1 h-px bg-slate-200" />
        <a href={`#${id}`} className="text-[11px] font-mono text-slate-400 hover:text-slate-600">#{id}</a>
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* ── sample data ─────────────────────────────────────────────────────────── */
const SAMPLE_USERS = [
  { name: "Sarah Mitchell" }, { name: "James Chen" }, { name: "Priya Patel" },
  { name: "Alice Wright" },   { name: "Bob Keller" }, { name: "Charlie Nguyen" },
];

interface DemoUser { id: string; name: string; email: string; role: string; status: string; joined: string }
const TABLE_DATA: DemoUser[] = [
  { id: "u1", name: "Alice Wright",   email: "alice.w@nutracorp.test",   role: "Admin",     status: "active",    joined: "Jan 12, 2025" },
  { id: "u2", name: "Bob Keller",     email: "bob.k@nutracorp.test",     role: "Developer", status: "suspended", joined: "Feb 3, 2025"  },
  { id: "u3", name: "Charlie Nguyen", email: "charlie.n@nutracorp.test", role: "Developer", status: "active",    joined: "Mar 18, 2025" },
  { id: "u4", name: "Dana Osei",      email: "dana.o@nutracorp.test",    role: "Viewer",    status: "pending",   joined: "Apr 2, 2025"  },
  { id: "u5", name: "Evan Marsh",     email: "evan.m@nutracorp.test",    role: "Viewer",    status: "active",    joined: "Jun 10, 2025" },
];

const TOC = [
  { id: "badge",      label: "Badge",      batch: 1 },
  { id: "button",     label: "Button",     batch: 1 },
  { id: "avatar",     label: "Avatar",     batch: 1 },
  { id: "card",       label: "Card",       batch: 1 },
  { id: "statcard",   label: "StatCard",   batch: 1 },
  { id: "emptystate", label: "EmptyState", batch: 1 },
  { id: "spinner",    label: "Spinner",    batch: 2 },
  { id: "alert",      label: "Alert",      batch: 2 },
  { id: "toast",      label: "Toast",      batch: 2 },
  { id: "modal",      label: "Modal",      batch: 2 },
  { id: "search",     label: "SearchBox",  batch: 2 },
  { id: "pagination", label: "Pagination", batch: 2 },
  { id: "datatable",  label: "DataTable",  batch: 2 },
  { id: "tabs",       label: "Tabs",       batch: 3 },
  { id: "breadcrumb", label: "Breadcrumb", batch: 3 },
  { id: "filterbar",  label: "FilterBar",  batch: 3 },
  { id: "drawer",     label: "Drawer",     batch: 3 },
  { id: "dropdown",   label: "Dropdown",   batch: 3 },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function PreviewPage() {
  const [modalOpen,   setModal]   = useState(false);
  const [confirmOpen, setConfirm] = useState(false);
  const [deleteOpen,  setDelete]  = useState(false);

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch]     = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const filteredData = TABLE_DATA.filter(u =>
    !tableSearch || u.name.toLowerCase().includes(tableSearch.toLowerCase()) || u.email.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const [tab1,    setTab1]    = useState("overview");
  const [tab2,    setTab2]    = useState("members");
  const [tab3,    setTab3]    = useState("details");
  const [filter,  setFilter]  = useState("");
  const [chips,   setChips]   = useState<string[]>([]);
  const [drawerR, setDrawerR] = useState(false);
  const [drawerL, setDrawerL] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              NutraTenant <span className="text-indigo-600">UI</span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">React Component Library — Batch 1 · 2 · 3</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">B1: 6</span>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">B2: 7</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">B3: 5</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <aside className="hidden lg:block w-44 shrink-0">
          <nav className="sticky top-24 flex flex-col gap-0.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Components</p>
            {TOC.map(item => (
              <a key={item.id} href={`#${item.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.batch === 1 ? "bg-indigo-400" : item.batch === 2 ? "bg-violet-400" : "bg-emerald-400"}`} />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-12">

          <Section title="Badge" id="badge" batch={1}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="Variants">
                {(["default","success","warning","error","info","muted","violet"] as const).map(v => <Badge key={v} variant={v}>{v}</Badge>)}
              </Row>
              <Row label="With dot">
                <Badge variant="success" dot>Active</Badge>
                <Badge variant="warning" dot>Pending</Badge>
                <Badge variant="error"   dot>Failed</Badge>
                <Badge variant="info"    dot>Processing</Badge>
              </Row>
              <Row label="Sizes">
                {(["xs","sm","md","lg"] as const).map(s => <Badge key={s} variant="default" size={s}>{s}</Badge>)}
              </Row>
              <Row label="StatusBadge">
                {["active","inactive","suspended","pending","approved","rejected","completed","processing","cancelled",
                  "delivered","connected","disconnected","error","healthy","degraded","online","offline","revoked","busy"]
                  .map(s => <StatusBadge key={s} status={s} dot />)}
              </Row>
              <Row label="RoleBadge">
                {["Super Admin","Admin","Moderator","Developer","Support Agent","Viewer","Owner","Member"].map(r => <RoleBadge key={r} role={r} />)}
              </Row>
              <Row label="PlanBadge">
                {["Free","Starter","Pro","Enterprise"].map(p => <PlanBadge key={p} plan={p} />)}
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="Button" id="button" batch={1}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="Variants">
                {(["primary","secondary","danger","ghost","outline","success","warning"] as const).map(v =>
                  <Button key={v} variant={v}>{v}</Button>)}
                <Button variant="link">link</Button>
              </Row>
              <Row label="Sizes">
                {(["xs","sm","md","lg"] as const).map(s => <Button key={s} size={s}>{s}</Button>)}
              </Row>
              <Row label="Icons & states">
                <Button icon={Plus}>New Group</Button>
                <Button icon={Trash2} variant="danger">Delete</Button>
                <Button icon={Download} variant="secondary" iconPosition="right">Export</Button>
                <Button loading>Saving…</Button>
                <Button disabled>Disabled</Button>
              </Row>
              <Row label="IconButton">
                <IconButton icon={Plus}     label="Add"      variant="primary"   />
                <IconButton icon={Trash2}   label="Delete"   variant="danger"    />
                <IconButton icon={Settings} label="Settings" variant="secondary" />
                <IconButton icon={Bell}     label="Notify"   variant="ghost"     />
                <IconButton icon={Search}   label="Search"   variant="outline"   size="sm" />
                <IconButton icon={Download} label="Download" size="lg" variant="success" />
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="Avatar" id="avatar" batch={1}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="Sizes">
                {(["xs","sm","md","lg","xl","2xl"] as const).map(s => <Avatar key={s} name="Sarah Mitchell" size={s} />)}
              </Row>
              <Row label="Status dots">
                {(["online","offline","busy","away"] as const).map(st => <Avatar key={st} name="James Chen" size="lg" status={st} />)}
              </Row>
              <Row label="Colour palette">
                {["Aria Wang","Ben Torres","Chloe Kim","Dan Park","Eve Sato","Fay Liu","Gus Ray","Hana Ito"].map(n => <Avatar key={n} name={n} size="md" />)}
              </Row>
              <Row label="AvatarGroup">
                <AvatarGroup users={SAMPLE_USERS} max={3} size="sm" />
                <AvatarGroup users={SAMPLE_USERS} max={4} size="md" />
                <AvatarGroup users={SAMPLE_USERS} max={5} size="lg" />
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="Card" id="card" batch={1}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader title="Simple Card" description="Header · Body · Footer" />
                <CardBody><p className="text-sm text-slate-600">White background, rounded-xl, subtle border + shadow-sm.</p></CardBody>
                <CardFooter><Button variant="secondary" size="sm">Cancel</Button><Button size="sm">Save</Button></CardFooter>
              </Card>
              <Card>
                <CardHeader title="Users" description="1,248 active members"
                  icon={<Users className="h-4 w-4" />}
                  action={<Button size="sm" icon={Plus}>Invite</Button>} />
                <CardBody><div className="flex gap-2"><StatusBadge status="active" dot /><StatusBadge status="pending" dot /><StatusBadge status="suspended" dot /></div></CardBody>
                <CardFooter align="between"><p className="text-xs text-slate-400">Updated 2 min ago</p><Button variant="link" size="sm">View all →</Button></CardFooter>
              </Card>
              <Card noPadding className="overflow-hidden">
                <CardHeader title="No-padding card" description="Content flush to edges" />
                <div className="divide-y divide-slate-50">
                  {["Engineering","Marketing","Design"].map(g => (
                    <div key={g} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2"><Avatar name={g} size="sm" /><span className="text-sm font-medium text-slate-800">{g}</span></div>
                      <RoleBadge role="Developer" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHeader title="Danger zone" icon={<AlertTriangle className="h-4 w-4" />} />
                <CardBody><p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-3">This action cannot be undone.</p></CardBody>
                <CardFooter align="between">
                  <Button variant="ghost" size="sm">Cancel</Button>
                  <Button variant="danger" size="sm" icon={Trash2}>Delete permanently</Button>
                </CardFooter>
              </Card>
            </div>
          </Section>

          <Section title="StatCard" id="statcard" batch={1}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                <StatCard icon={ShoppingBag}     label="Total Orders"     value="2,568"   color="indigo"  trend="+14% vs last week"  trendUp />
                <StatCard icon={DollarSign}      label="Total Revenue"    value="$48,750" color="emerald" trend="+9% vs last month"   trendUp />
                <StatCard icon={UtensilsCrossed} label="Meals Served"     value="5,842"   color="violet"  trend="+11% this month"     trendUp />
                <StatCard icon={Users}           label="Active Customers" value="1,248"   color="sky"     trend="-3% vs yesterday"    trendUp={false} />
                <StatCard icon={Clock}           label="Pending Orders"   value="156"     color="amber"   sub="Awaiting fulfilment" />
              </div>
              <Row label="Loading skeleton"><div className="w-full"><SkeletonStatRow count={4} /></div></Row>
            </div>
          </Section>

          <Section title="EmptyState" id="emptystate" batch={1}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card noPadding><EmptyState icon={FileText} title="No documents" description="Upload your first document." action={<Button icon={Plus} size="sm">Upload</Button>} /></Card>
              <Card noPadding><EmptyState icon={Users}    title="No members"   description="Add users to this group."    action={<Button icon={Plus} size="sm" variant="outline">Add Member</Button>} /></Card>
              <Card noPadding><EmptyState icon={Search}   title="No results"   description="Try adjusting your search." /></Card>
              <Card noPadding><EmptyState icon={Shield}   title="No policies"  compact action={<Button size="xs">Create Policy</Button>} /></Card>
              <Card noPadding><EmptyState icon={Package}  title="Empty" compact /></Card>
              <Card noPadding><EmptyState title="Nothing here yet" description="Items will appear here." compact /></Card>
            </div>
          </Section>

          <Section title="Spinner & Skeletons" id="spinner" batch={2}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="Spinner sizes">
                {(["xs","sm","md","lg","xl"] as const).map(s => <Spinner key={s} size={s} />)}
              </Row>
              <Row label="ProgressBar">
                <div className="w-full flex flex-col gap-3 max-w-sm">
                  <ProgressBar value={77} label="Calories" showValue color="amber" />
                  <ProgressBar value={61} label="Protein"  showValue color="indigo" />
                  <ProgressBar value={90} label="Storage"  showValue color="emerald" size="md" />
                  <ProgressBar value={42} label="CPU"      showValue color="red" size="xs" />
                </div>
              </Row>
              <Row label="SkeletonCard">
                <SkeletonCard rows={3} className="w-64" />
                <SkeletonCard rows={2} showAvatar className="w-64" />
              </Row>
              <Row label="SkeletonTable (5 rows × 4 cols)">
                <SkeletonTable rows={5} cols={4} className="w-full" />
              </Row>
              <Row label="LoadingOverlay">
                <div className="relative h-24 w-64 rounded-xl border border-slate-200 bg-white">
                  <LoadingOverlay label="Fetching data…" />
                </div>
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="Alert & Banner" id="alert" batch={2}>
            <Card noPadding><CardBody className="flex flex-col gap-4">
              <Alert variant="info"    title="Info alert"   >Something to note about this section.</Alert>
              <Alert variant="success" title="Saved!"       >Your changes have been applied successfully.</Alert>
              <Alert variant="warning" title="Heads up"     >This action may take a few minutes to complete.</Alert>
              <Alert variant="error"   title="Error"        >Failed to save. Please try again.</Alert>
              <Alert variant="info"    onDismiss={() => {}}>Dismissible alert — no title, just body text.</Alert>
              <Alert variant="success" compact>Compact variant — useful for form feedback.</Alert>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Banner</p>
                <div className="flex flex-col gap-2">
                  <Banner variant="info"    showIcon>Preview mode — changes are local only.</Banner>
                  <Banner variant="warning" showIcon onDismiss={() => {}}>Your session expires in 5 minutes.</Banner>
                  <Banner variant="success" showIcon>Deployment completed successfully.</Banner>
                  <Banner variant="error"   showIcon>Service disruption detected in Region EU-West.</Banner>
                </div>
              </div>
            </CardBody></Card>
          </Section>

          <Section title="Toast" id="toast" batch={2}>
            <Card noPadding><CardBody>
              <p className="mb-4 text-xs text-slate-400">Static previews — live toasts via <code className="font-mono text-indigo-500">useToast()</code> from <code className="font-mono text-indigo-500">ToastProvider</code>.</p>
              <div className="flex flex-wrap gap-3">
                <ToastPreview item={{ variant: "success", title: "Saved!", message: "Group settings updated successfully." }} />
                <ToastPreview item={{ variant: "error",   title: "Error",  message: "Failed to connect. Please retry."    }} />
                <ToastPreview item={{ variant: "warning", title: "Warning",message: "Storage limit at 90% capacity."      }} />
                <ToastPreview item={{ variant: "info",    title: "Info",   message: "New policy version available."       }} />
              </div>
            </CardBody></Card>
          </Section>

          <Section title="Modal" id="modal" batch={2}>
            <Card noPadding><CardBody className="flex flex-col gap-4">
              <Row label="Triggers">
                <Button icon={Info}          onClick={() => setModal(true)}>Open Modal</Button>
                <Button icon={AlertTriangle} variant="warning" onClick={() => setConfirm(true)}>Confirmation Dialog</Button>
                <Button icon={Trash2}        variant="danger"  onClick={() => setDelete(true)}>Delete Dialog</Button>
              </Row>
            </CardBody></Card>
            <Modal open={modalOpen} onClose={() => setModal(false)}
              title="Edit Organization" description="Update your org name and status."
              footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button icon={CheckCircle}>Save changes</Button></>}>
              <div className="flex flex-col gap-4">
                <div><label className="block text-xs font-semibold text-slate-700">Name</label>
                  <input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="NutraCorp" /></div>
              </div>
            </Modal>
            <ConfirmationDialog open={confirmOpen} onClose={() => setConfirm(false)} onConfirm={() => setConfirm(false)}
              variant="warning" title="Revoke all sessions?" description="All active sessions across all devices will be terminated immediately." confirmLabel="Revoke sessions" />
            <DeleteDialog open={deleteOpen} onClose={() => setDelete(false)} onConfirm={() => setDelete(false)} itemName="Engineering Group" />
          </Section>

          <Section title="SearchBox" id="search" batch={2}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="Sizes">
                <SearchBox value={search} onChange={setSearch} size="sm" placeholder="Small search…" />
                <SearchBox value={search} onChange={setSearch} size="md" placeholder="Medium search…" />
                <SearchBox value={search} onChange={setSearch} size="lg" placeholder="Large search…" />
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="Pagination" id="pagination" batch={2}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="Interactive with page-size picker">
                <div className="w-full">
                  <Pagination total={287} page={page} pageSize={pageSize}
                    onPageChange={setPage} onPageSizeChange={setPageSize} />
                </div>
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="DataTable" id="datatable" batch={2}>
            <div className="flex flex-col gap-3">
              <TableToolbar
                left={<SearchBox value={tableSearch} onChange={setTableSearch} placeholder="Search users…" />}
                right={<><Button variant="secondary" size="sm" icon={Download}>Export</Button><Button size="sm" icon={UserPlus}>Invite</Button></>}
              />
              <DataTable<DemoUser>
                columns={[
                  { key: "name", header: "User", render: r => (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name} size="sm" />
                      <div><p className="text-xs font-medium text-slate-900">{r.name}</p><p className="text-[11px] text-slate-400">{r.email}</p></div>
                    </div>
                  )},
                  { key: "role",   header: "Role",   render: r => <RoleBadge role={r.role} /> },
                  { key: "status", header: "Status", render: r => <StatusBadge status={r.status} dot /> },
                  { key: "joined", header: "Joined", className: "text-slate-500 text-xs" },
                  { key: "actions", header: "", align: "right", render: () => (
                    <div className="flex items-center justify-end gap-1.5">
                      <IconButton icon={Settings} label="Settings" size="sm" />
                      <IconButton icon={Trash2}   label="Delete"   size="sm" variant="danger" />
                    </div>
                  )},
                ]}
                data={filteredData}
                rowKey={r => r.id}
                emptyTitle="No users found"
                emptyDescription="Try adjusting your search."
                emptyIcon={Users}
              />
            </div>
          </Section>

          <Section title="Tabs" id="tabs" batch={3}>
            <Card noPadding><CardBody className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Underline (default)</p>
                <Tabs variant="underline" activeKey={tab1} onChange={setTab1}
                  tabs={[
                    { key: "overview", label: "Overview", icon: LayoutDashboard, badge: 3 },
                    { key: "users",    label: "Users",    icon: Users,           badge: 24 },
                    { key: "policies", label: "Policies", icon: Lock },
                    { key: "billing",  label: "Billing",  icon: DollarSign, disabled: true },
                  ]}
                />
                <TabPanel activeKey={tab1} tabKey="overview"><p className="text-sm text-slate-600 pt-2">Overview panel content.</p></TabPanel>
                <TabPanel activeKey={tab1} tabKey="users"><p className="text-sm text-slate-600 pt-2">Users panel — {TABLE_DATA.length} records.</p></TabPanel>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pills</p>
                <Tabs variant="pills" activeKey={tab2} onChange={setTab2} tabs={[
                  { key: "members",  label: "Members",  icon: Users    },
                  { key: "roles",    label: "Roles",    icon: Shield   },
                  { key: "apps",     label: "Apps",     icon: Globe    },
                  { key: "activity", label: "Activity", icon: Activity, badge: 5 },
                ]} />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cards / Segmented</p>
                <Tabs variant="cards" activeKey={tab3} onChange={setTab3} tabs={[
                  { key: "details",  label: "Details"  },
                  { key: "settings", label: "Settings" },
                  { key: "logs",     label: "Logs", badge: 12 },
                ]} />
              </div>
            </CardBody></Card>
          </Section>

          <Section title="Breadcrumb" id="breadcrumb" batch={3}>
            <Card noPadding><CardBody className="flex flex-col gap-5">
              <Row label="With home icon">
                <Breadcrumb showHome items={[{ label: "Organizations" }, { label: "NutraCorp", href: "#" }, { label: "Settings" }]} />
              </Row>
            </CardBody></Card>
          </Section>

          <Section title="FilterBar" id="filterbar" batch={3}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <FilterBar value={filter} onChange={setFilter} options={[
                  { label: "Active",    value: "active",    count: 42 },
                  { label: "Pending",   value: "pending",   count: 8  },
                  { label: "Suspended", value: "suspended", count: 3  },
                  { label: "Inactive",  value: "inactive",  count: 15 },
                ]} />
              </div>
              <div className="flex flex-col gap-3">
                <FilterChips value={chips} onChange={setChips} options={[
                  { label: "Admin",     value: "admin"     },
                  { label: "Moderator", value: "moderator" },
                  { label: "Developer", value: "developer" },
                  { label: "Viewer",    value: "viewer"    },
                ]} />
              </div>
            </CardBody></Card>
          </Section>

          <Section title="Drawer" id="drawer" batch={3}>
            <Card noPadding><CardBody>
              <Row label="Triggers">
                <Button icon={BookOpen}           onClick={() => setDrawerR(true)}>Open Right Drawer</Button>
                <Button icon={BookOpen} variant="secondary" onClick={() => setDrawerL(true)}>Open Left Drawer</Button>
              </Row>
            </CardBody></Card>
            <Drawer open={drawerR} onClose={() => setDrawerR(false)}
              title="User Details" description="Sarah Mitchell · sarah.m@nutracorp.test"
              footer={<><Button variant="secondary" onClick={() => setDrawerR(false)}>Close</Button><Button icon={Edit2}>Edit User</Button></>}>
              <div className="flex items-center gap-3">
                <Avatar name="Sarah Mitchell" size="xl" status="online" />
                <div>
                  <p className="font-semibold text-slate-900">Sarah Mitchell</p>
                  <p className="text-sm text-slate-500">sarah.m@nutracorp.test</p>
                </div>
              </div>
            </Drawer>
            <Drawer side="left" open={drawerL} onClose={() => setDrawerL(false)} title="Navigation" size="sm">
              <nav className="flex flex-col gap-1">
                {[
                  { icon: LayoutDashboard, label: "Dashboard" },
                  { icon: Users,           label: "Users"     },
                  { icon: Shield,          label: "Policies"  },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} type="button"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Icon className="h-4 w-4 text-slate-400" />{label}
                  </button>
                ))}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button type="button" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full">
                    <LogOut className="h-4 w-4" />Logout
                  </button>
                </div>
              </nav>
            </Drawer>
          </Section>

          <Section title="Dropdown & KebabMenu" id="dropdown" batch={3}>
            <Card noPadding><CardBody className="flex flex-col gap-6">
              <Row label="DropdownMenu">
                <DropdownMenu
                  align="left"
                  trigger={<Button variant="secondary" iconPosition="right" icon={ChevronDown}>Actions</Button>}
                  items={[
                    { key: "view",   label: "View details", icon: Eye    },
                    { key: "edit",   label: "Edit",         icon: Edit2  },
                    { key: "copy",   label: "Duplicate",    icon: Copy   },
                    { key: "sep1",   label: "",             separator: true },
                    { key: "delete", label: "Delete",       icon: Trash2, variant: "danger" },
                  ]}
                  onSelect={key => console.log("selected:", key)}
                />
              </Row>
              <Row label="KebabMenu (⋮ per-row)">
                <div className="flex items-center gap-4">
                  {TABLE_DATA.slice(0, 3).map(u => (
                    <div key={u.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                      <Avatar name={u.name} size="sm" />
                      <span className="text-sm font-medium text-slate-800 w-28">{u.name}</span>
                      <KebabMenu
                        items={[
                          { key: "edit",    label: "Edit",    icon: Edit2  },
                          { key: "disable", label: "Disable", icon: Lock   },
                          { key: "sep",     label: "",        separator: true },
                          { key: "remove",  label: "Remove",  icon: Trash2, variant: "danger" },
                        ]}
                        onSelect={key => console.log(u.id, key)}
                      />
                    </div>
                  ))}
                </div>
              </Row>
            </CardBody></Card>
          </Section>

          <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            NutraTenant UI · 18 components · B1 + B2 + B3 complete
          </div>
        </div>
      </div>
    </div>
  );
}

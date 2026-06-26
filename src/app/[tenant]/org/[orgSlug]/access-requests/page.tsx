"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Clock, CheckCircle, XCircle, ChevronDown, Plus } from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";
import {
  Banner, Button,
  Avatar, Badge, StatusBadge, StatCard,
  SearchBox, FilterBar,
  Modal,
  EmptyState,
  Alert,
} from "@/components/ui";

type RequestStatus = "pending" | "approved" | "rejected";
type ResourceType  = "Application" | "Group" | "Role";

interface AccessRequest {
  id: string; requester: string; email: string;
  resource: string; resourceType: ResourceType;
  reason: string; requestedAt: string; status: RequestStatus;
  reviewedBy?: string; reviewedAt?: string;
}

const SEED_REQUESTS: AccessRequest[] = [
  { id: "ar1", requester: "Priya Patel",    email: "priya.p@nutracorp.test",   resource: "SecurePass",   resourceType: "Application", reason: "Need access for security audits",         requestedAt: "2 hr ago",   status: "pending"   },
  { id: "ar2", requester: "Evan Marsh",     email: "evan.m@nutracorp.test",    resource: "Engineering",  resourceType: "Group",       reason: "Joining the infra team next sprint",       requestedAt: "5 hr ago",   status: "pending"   },
  { id: "ar3", requester: "Charlie Nguyen", email: "charlie.n@nutracorp.test", resource: "Developer",    resourceType: "Role",        reason: "Promoted to dev role by manager",          requestedAt: "1 day ago",  status: "approved",  reviewedBy: "James Chen",     reviewedAt: "22 hr ago" },
  { id: "ar4", requester: "Hana Popov",     email: "hana.p@nutracorp.test",    resource: "DataVault",    resourceType: "Application", reason: "Research project needs data access",       requestedAt: "1 day ago",  status: "rejected",  reviewedBy: "Sarah Mitchell", reviewedAt: "20 hr ago" },
  { id: "ar5", requester: "George Lin",     email: "george.l@nutracorp.test",  resource: "Leadership",   resourceType: "Group",       reason: "Invited by CTO for strategy meetings",     requestedAt: "2 days ago", status: "approved",  reviewedBy: "Sarah Mitchell", reviewedAt: "1 day ago"  },
  { id: "ar6", requester: "Dana Osei",      email: "dana.o@nutracorp.test",    resource: "AnalyticsHub", resourceType: "Application", reason: "Needs analytics for campaign reporting",   requestedAt: "3 days ago", status: "pending"   },
];

const RESOURCES_BY_TYPE: Record<ResourceType, string[]> = {
  Application: ["NutraCRM","SecurePass","WorkflowPro","MediaManager","DataVault","AnalyticsHub"],
  Group:       ["Engineering","Marketing","Leadership","Support","Finance","Design"],
  Role:        ["Moderator","Developer","Support Agent","Viewer"],
};

const RESOURCE_TYPES: ResourceType[] = ["Application","Group","Role"];

const STATUS_ICON: Record<RequestStatus, typeof Clock> = {
  pending:  Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const RESOURCE_TYPE_VARIANT: Record<ResourceType, "info" | "violet" | "warning"> = {
  Application: "info",
  Group:       "violet",
  Role:        "warning",
};

/* ── Create Request Modal ───────────────────────────────────────────────── */
function CreateRequestModal({ currentUser, open, onClose, onSubmit }: {
  currentUser: { name: string; email: string };
  open: boolean; onClose: () => void;
  onSubmit: (req: AccessRequest) => void;
}) {
  const [resourceType, setResourceType] = useState<ResourceType>("Application");
  const [resource, setResource]         = useState("");
  const [reason, setReason]             = useState("");
  const [fieldErrors, setFieldErrors]   = useState<{ resource?: string; reason?: string }>({});
  const [submitted, setSubmitted]       = useState(false);

  function reset() { setResourceType("Application"); setResource(""); setReason(""); setFieldErrors({}); setSubmitted(false); }

  function handleTypeChange(t: ResourceType) { setResourceType(t); setResource(""); setFieldErrors({}); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof fieldErrors = {};
    if (!resource)                  errs.resource = "Please select a resource.";
    if (reason.trim().length < 10)  errs.reason   = "Please provide at least 10 characters.";
    if (Object.keys(errs).length)   { setFieldErrors(errs); return; }

    onSubmit({
      id: `ar-${Date.now()}`, requester: currentUser.name, email: currentUser.email,
      resource, resourceType, reason: reason.trim(), requestedAt: "just now", status: "pending",
    });
    setSubmitted(true);
  }

  function handleClose() { reset(); onClose(); }

  if (submitted) {
    return (
      <Modal open={open} onClose={handleClose} title="Request Submitted" size="sm"
        footer={<Button onClick={handleClose} fullWidth>Done</Button>}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500">
            Your request for <span className="font-semibold text-slate-700">{resource}</span> has been sent to the org admins for review.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}
      title="New Access Request"
      description={`Submitting as ${currentUser.name}`}
      footer={<><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button icon={ShieldCheck} type="submit" form="access-request-form">Submit Request</Button></>}
    >
      <form id="access-request-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Resource type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Resource Type</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {RESOURCE_TYPES.map(t => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  resourceType === t ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Resource */}
        <div>
          <label htmlFor="resource" className="block text-xs font-semibold text-slate-700">
            {resourceType} <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <select id="resource" value={resource}
              onChange={e => { setResource(e.target.value); setFieldErrors(p => ({ ...p, resource: undefined })); }}
              className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${fieldErrors.resource ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}>
              <option value="">Select a {resourceType.toLowerCase()}…</option>
              {RESOURCES_BY_TYPE[resourceType].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {fieldErrors.resource && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.resource}</p>}
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-xs font-semibold text-slate-700">
            Reason for Access <span className="text-red-500">*</span>
          </label>
          <textarea id="reason" rows={4} value={reason}
            onChange={e => { setReason(e.target.value); setFieldErrors(p => ({ ...p, reason: undefined })); }}
            placeholder="Explain why you need access to this resource…"
            className={`mt-1.5 w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${fieldErrors.reason ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
          />
          <div className="mt-1 flex items-center justify-between">
            {fieldErrors.reason ? <p className="text-[11px] text-red-600">{fieldErrors.reason}</p> : <span />}
            <p className={`text-[11px] ${reason.length < 10 ? "text-slate-400" : "text-emerald-600"}`}>{reason.length} / 500</p>
          </div>
        </div>

        <Alert variant="info" compact>
          Your request will be reviewed by an org admin. You'll see the status update on this page once a decision is made.
        </Alert>
      </form>
    </Modal>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function AccessRequestsPage() {
  const { orgSlug }     = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const isMember        = currentUser.role === "member";
  const display         = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const [requests, setRequests]           = useState<AccessRequest[]>(SEED_REQUESTS);
  const [showModal, setShowModal]         = useState(false);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("");

  const visible = requests
    .filter(r => isMember ? r.email === currentUser.email : true)
    .filter(r => !statusFilter || r.status === statusFilter)
    .filter(r => !search || r.requester.toLowerCase().includes(search.toLowerCase()) || r.resource.toLowerCase().includes(search.toLowerCase()));

  const pending  = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const rejected = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — approve/reject actions are disabled until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            {isMember ? "My Access Requests" : "Access Requests"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isMember ? "Your pending and resolved requests in" : "All access requests across"}{" "}
            <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Request</Button>
      </div>

      {!isMember && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Clock}        label="Pending"  value={pending}          color="amber"   />
          <StatCard icon={CheckCircle}  label="Approved" value={approved}         color="emerald" />
          <StatCard icon={XCircle}      label="Rejected" value={rejected}         color="rose"    />
          <StatCard icon={ShieldCheck}  label="Total"    value={requests.length}  color="indigo"  />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={search} onChange={setSearch} placeholder="Search requests…" />
        <FilterBar value={statusFilter} onChange={setStatusFilter} options={[
          { label: "Pending",  value: "pending",  count: pending  },
          { label: "Approved", value: "approved", count: approved },
          { label: "Rejected", value: "rejected", count: rejected },
        ]} />
      </div>

      <div className="flex flex-col gap-4">
        {visible.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No requests found" description="Try adjusting the search or filter." compact />
        ) : visible.map(req => {
          const StatusIcon = STATUS_ICON[req.status];
          return (
            <div key={req.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={req.requester} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{req.requester}</p>
                    <p className="text-xs text-slate-400">{req.email}</p>
                  </div>
                </div>
                <StatusBadge status={req.status} dot />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Requesting Access To</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant={RESOURCE_TYPE_VARIANT[req.resourceType]} size="xs">{req.resourceType}</Badge>
                    <p className="text-sm font-semibold text-slate-900">{req.resource}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Reason</p>
                  <p className="mt-1 text-xs text-slate-700">{req.reason}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Requested {req.requestedAt}
                  {req.reviewedBy && ` · Reviewed by ${req.reviewedBy} ${req.reviewedAt}`}
                </p>
                {req.status === "pending" && !isMember && (
                  <div className="flex gap-2">
                    <Button variant="success" size="xs" icon={CheckCircle}>Approve</Button>
                    <Button variant="danger"  size="xs" icon={XCircle}>Reject</Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateRequestModal
        open={showModal}
        currentUser={{ name: currentUser.name, email: currentUser.email }}
        onClose={() => setShowModal(false)}
        onSubmit={req => { setRequests(p => [req, ...p]); }}
      />
    </div>
  );
}

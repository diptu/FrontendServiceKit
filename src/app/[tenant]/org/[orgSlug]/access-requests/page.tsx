"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";

type RequestStatus = "pending" | "approved" | "rejected";
type ResourceType  = "Application" | "Group" | "Role";

interface AccessRequest {
  id: string;
  requester: string;
  email: string;
  resource: string;
  resourceType: ResourceType;
  reason: string;
  requestedAt: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

const SEED_REQUESTS: AccessRequest[] = [
  { id: "ar1", requester: "Priya Patel",    email: "priya.p@nutracorp.test",   resource: "SecurePass",   resourceType: "Application", reason: "Need access for security audits",         requestedAt: "2 hr ago",   status: "pending"   },
  { id: "ar2", requester: "Evan Marsh",     email: "evan.m@nutracorp.test",    resource: "Engineering",  resourceType: "Group",       reason: "Joining the infra team next sprint",       requestedAt: "5 hr ago",   status: "pending"   },
  { id: "ar3", requester: "Charlie Nguyen", email: "charlie.n@nutracorp.test", resource: "Developer",    resourceType: "Role",        reason: "Promoted to dev role by manager",          requestedAt: "1 day ago",  status: "approved",  reviewedBy: "James Chen",    reviewedAt: "22 hr ago" },
  { id: "ar4", requester: "Hana Popov",     email: "hana.p@nutracorp.test",    resource: "DataVault",    resourceType: "Application", reason: "Research project needs data access",       requestedAt: "1 day ago",  status: "rejected",  reviewedBy: "Sarah Mitchell",reviewedAt: "20 hr ago" },
  { id: "ar5", requester: "George Lin",     email: "george.l@nutracorp.test",  resource: "Leadership",   resourceType: "Group",       reason: "Invited by CTO for strategy meetings",     requestedAt: "2 days ago", status: "approved",  reviewedBy: "Sarah Mitchell",reviewedAt: "1 day ago"  },
  { id: "ar6", requester: "Dana Osei",      email: "dana.o@nutracorp.test",    resource: "AnalyticsHub", resourceType: "Application", reason: "Needs analytics for campaign reporting",   requestedAt: "3 days ago", status: "pending"   },
];

const RESOURCES_BY_TYPE: Record<ResourceType, string[]> = {
  Application: ["NutraCRM", "SecurePass", "WorkflowPro", "MediaManager", "DataVault", "AnalyticsHub"],
  Group:       ["Engineering", "Marketing", "Leadership", "Support", "Finance", "Design"],
  Role:        ["Moderator", "Developer", "Support Agent", "Viewer"],
};

const RESOURCE_TYPES: ResourceType[] = ["Application", "Group", "Role"];

const STATUS_CONFIG: Record<RequestStatus, { icon: typeof Clock; badge: string; label: string }> = {
  pending:  { icon: Clock,       badge: "bg-amber-50 text-amber-700",    label: "Pending"  },
  approved: { icon: CheckCircle, badge: "bg-emerald-50 text-emerald-700",label: "Approved" },
  rejected: { icon: XCircle,     badge: "bg-red-50 text-red-700",        label: "Rejected" },
};

const RESOURCE_TYPE_BADGE: Record<ResourceType, string> = {
  Application: "bg-sky-50 text-sky-700",
  Group:       "bg-violet-50 text-violet-700",
  Role:        "bg-amber-50 text-amber-700",
};

/* ── Create Request Modal ──────────────────────────────────────────────── */
interface CreateModalProps {
  currentUser: { name: string; email: string };
  onClose: () => void;
  onSubmit: (req: AccessRequest) => void;
}

function CreateRequestModal({ currentUser, onClose, onSubmit }: CreateModalProps) {
  const [resourceType, setResourceType] = useState<ResourceType>("Application");
  const [resource, setResource]         = useState("");
  const [reason, setReason]             = useState("");
  const [errors, setErrors]             = useState<{ resource?: string; reason?: string }>({});
  const [submitted, setSubmitted]       = useState(false);

  const resources = RESOURCES_BY_TYPE[resourceType];

  function handleTypeChange(t: ResourceType) {
    setResourceType(t);
    setResource("");
    setErrors({});
  }

  function validate() {
    const e: typeof errors = {};
    if (!resource)            e.resource = "Please select a resource.";
    if (reason.trim().length < 10) e.reason = "Please provide at least 10 characters.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newRequest: AccessRequest = {
      id:           `ar-${Date.now()}`,
      requester:    currentUser.name,
      email:        currentUser.email,
      resource,
      resourceType,
      reason:       reason.trim(),
      requestedAt:  "just now",
      status:       "pending",
    };

    onSubmit(newRequest);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Request Submitted</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your request for <span className="font-semibold text-slate-700">{resource}</span> has been sent to the org admins for review.
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
            <h2 className="text-base font-bold text-slate-900">New Access Request</h2>
            <p className="mt-0.5 text-xs text-slate-400">Submitting as <span className="font-medium">{currentUser.name}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* Resource type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">Resource Type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {RESOURCE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    resourceType === t
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
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
              <select
                id="resource"
                value={resource}
                onChange={e => { setResource(e.target.value); setErrors(prev => ({ ...prev, resource: undefined })); }}
                className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.resource ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
              >
                <option value="">Select a {resourceType.toLowerCase()}…</option>
                {resources.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.resource && <p className="mt-1 text-[11px] text-red-600">{errors.resource}</p>}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-xs font-semibold text-slate-700">
              Reason for Access <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors(prev => ({ ...prev, reason: undefined })); }}
              placeholder="Explain why you need access to this resource…"
              className={`mt-1.5 w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.reason ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.reason
                ? <p className="text-[11px] text-red-600">{errors.reason}</p>
                : <span />
              }
              <p className={`text-[11px] ${reason.length < 10 ? "text-slate-400" : "text-emerald-600"}`}>
                {reason.length} / 500
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
            Your request will be reviewed by an org admin. You&apos;ll see the status update on this page once a decision is made.
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
              <ShieldCheck className="h-4 w-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function AccessRequestsPage() {
  const { orgSlug }          = useParams<{ orgSlug: string }>();
  const { currentUser }      = usePreviewUser();
  const isMember             = currentUser.role === "member";
  const display              = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const [requests, setRequests] = useState<AccessRequest[]>(SEED_REQUESTS);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

  const visibleRequests = requests
    .filter(r => isMember ? r.email === currentUser.email : true)
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r =>
      !search ||
      r.requester.toLowerCase().includes(search.toLowerCase()) ||
      r.resource.toLowerCase().includes(search.toLowerCase())
    );

  function handleNewRequest(req: AccessRequest) {
    setRequests(prev => [req, ...prev]);
  }

  const pending  = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const rejected = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>
        Preview mode — approve/reject actions are disabled until role gates are enforced.
      </PreviewBanner>

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
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />New Request
        </button>
      </div>

      {/* Summary cards */}
      {!isMember && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Pending",  value: pending,  color: "text-amber-600"   },
            { label: "Approved", value: approved, color: "text-emerald-600" },
            { label: "Rejected", value: rejected, color: "text-red-600"     },
            { label: "Total",    value: requests.length, color: "text-slate-900" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-slate-400" />
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="flex flex-col gap-4">
        {visibleRequests.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No requests found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting the search or filter.</p>
          </div>
        ) : (
          visibleRequests.map(req => {
            const cfg = STATUS_CONFIG[req.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={req.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {req.requester.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{req.requester}</p>
                      <p className="text-xs text-slate-400">{req.email}</p>
                    </div>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                    <StatusIcon className="h-3 w-3" />{cfg.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Requesting Access To</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RESOURCE_TYPE_BADGE[req.resourceType]}`}>
                        {req.resourceType}
                      </span>
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
                      <button type="button" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                        Approve
                      </button>
                      <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateRequestModal
          currentUser={{ name: currentUser.name, email: currentUser.email }}
          onClose={() => setShowModal(false)}
          onSubmit={(req) => { handleNewRequest(req); }}
        />
      )}
    </div>
  );
}

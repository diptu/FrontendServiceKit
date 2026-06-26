import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { Gavel, Plus } from "lucide-react";

interface Props { params: Promise<{ orgSlug: string }> }

const POLICIES = [
  {
    id: "pol1", name: "admin-full-access",        effect: "Allow", priority: 100,
    description: "Grants full access to all resources for Admin and Super Admin roles.",
    conditions: ["role IN [super_admin, admin]"],
    resources: ["*"], actions: ["*"], status: "active",
  },
  {
    id: "pol2", name: "moderator-user-mgmt",       effect: "Allow", priority: 80,
    description: "Allows moderators to read and write user records.",
    conditions: ["role = moderator", "mfa_verified = true"],
    resources: ["users", "groups"], actions: ["read", "write"], status: "active",
  },
  {
    id: "pol3", name: "developer-app-access",      effect: "Allow", priority: 70,
    description: "Grants developers access to application resources and API keys.",
    conditions: ["role = developer"],
    resources: ["applications", "api_keys"], actions: ["read", "write"], status: "active",
  },
  {
    id: "pol4", name: "deny-billing-non-owner",    effect: "Deny",  priority: 90,
    description: "Prevents any non-owner from accessing billing resources.",
    conditions: ["role NOT IN [super_admin]"],
    resources: ["billing"], actions: ["*"], status: "active",
  },
  {
    id: "pol5", name: "viewer-readonly",           effect: "Allow", priority: 10,
    description: "Baseline read-only access for Viewer role.",
    conditions: ["role = viewer"],
    resources: ["users", "groups", "applications"], actions: ["read"], status: "active",
  },
  {
    id: "pol6", name: "lockout-suspended-users",   effect: "Deny",  priority: 999,
    description: "Denies all access when account_locked flag is set.",
    conditions: ["account_locked = true"],
    resources: ["*"], actions: ["*"], status: "active",
  },
];

export default async function PoliciesPage({ params }: Props) {
  const { orgSlug } = await params;
  const display = orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — policy management is read-only until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Gavel className="h-5 w-5 text-indigo-500" />Policies
          </h1>
          <p className="mt-1 text-sm text-slate-500">ABAC policies enforced in <span className="font-medium text-slate-700">{display}</span></p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          <Plus className="h-4 w-4" />New Policy
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {POLICIES.map(pol => (
          <div key={pol.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${pol.effect === "Allow" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {pol.effect === "Allow" ? "✓" : "✗"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-slate-900">{pol.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pol.effect === "Allow" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {pol.effect}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      Priority {pol.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{pol.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Conditions</p>
                {pol.conditions.map(c => (
                  <p key={c} className="font-mono text-[11px] text-slate-700">{c}</p>
                ))}
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Resources</p>
                <div className="flex flex-wrap gap-1">
                  {pol.resources.map(r => (
                    <span key={r} className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">{r}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Actions</p>
                <div className="flex flex-wrap gap-1">
                  {pol.actions.map(a => (
                    <span key={a} className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

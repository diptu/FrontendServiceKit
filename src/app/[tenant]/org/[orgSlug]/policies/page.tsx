import { Gavel, Plus, Check, X } from "lucide-react";
import {
  Banner, Button, Badge,
  Card, CardBody,
} from "@/components/ui";

interface Props { params: Promise<{ orgSlug: string }> }

const POLICIES = [
  {
    id: "pol1", name: "admin-full-access",      effect: "Allow", priority: 100,
    description: "Grants full access to all resources for Admin and Super Admin roles.",
    conditions: ["role IN [super_admin, admin]"],
    resources: ["*"], actions: ["*"], status: "active",
  },
  {
    id: "pol2", name: "moderator-user-mgmt",     effect: "Allow", priority: 80,
    description: "Allows moderators to read and write user records.",
    conditions: ["role = moderator", "mfa_verified = true"],
    resources: ["users", "groups"], actions: ["read", "write"], status: "active",
  },
  {
    id: "pol3", name: "developer-app-access",    effect: "Allow", priority: 70,
    description: "Grants developers access to application resources and API keys.",
    conditions: ["role = developer"],
    resources: ["applications", "api_keys"], actions: ["read", "write"], status: "active",
  },
  {
    id: "pol4", name: "deny-billing-non-owner",  effect: "Deny",  priority: 90,
    description: "Prevents any non-owner from accessing billing resources.",
    conditions: ["role NOT IN [super_admin]"],
    resources: ["billing"], actions: ["*"], status: "active",
  },
  {
    id: "pol5", name: "viewer-readonly",         effect: "Allow", priority: 10,
    description: "Baseline read-only access for Viewer role.",
    conditions: ["role = viewer"],
    resources: ["users", "groups", "applications"], actions: ["read"], status: "active",
  },
  {
    id: "pol6", name: "lockout-suspended-users", effect: "Deny",  priority: 999,
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
      <Banner variant="info" showIcon>
        Preview mode — policy management is read-only until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Gavel className="h-5 w-5 text-indigo-500" />Policies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ABAC policies enforced in <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        <Button icon={Plus}>New Policy</Button>
      </div>

      <div className="flex flex-col gap-4">
        {POLICIES.map(pol => {
          const isAllow = pol.effect === "Allow";
          return (
            <Card key={pol.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isAllow ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {isAllow ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-sm font-semibold text-slate-900">{pol.name}</code>
                        <Badge variant={isAllow ? "success" : "error"} size="xs">{pol.effect}</Badge>
                        <Badge variant="muted" size="xs">Priority {pol.priority}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{pol.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">Edit</Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Conditions", items: pol.conditions, mono: true },
                    { label: "Resources",  items: pol.resources,  mono: true },
                    { label: "Actions",    items: pol.actions,    mono: true },
                  ].map(({ label, items, mono }) => (
                    <div key={label} className="rounded-lg bg-slate-50 p-3">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                      <div className="flex flex-wrap gap-1">
                        {items.map(item => (
                          <span key={item} className={`rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 ${mono ? "font-mono" : ""}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

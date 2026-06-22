"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";

interface ReasonCopy {
  title: string;
  description: string;
}

const REASON_COPY: Record<string, ReasonCopy> = {
  tenant_isolation_violation: {
    title: "This resource belongs to a different organization",
    description: "Cross-tenant access is never allowed, regardless of role or permissions.",
  },
  role_not_permitted: {
    title: "Your role doesn't permit this action",
    description: "Your current role isn't granted this action on this resource. Ask an administrator if you need elevated access.",
  },
  insufficient_clearance: {
    title: "This resource requires a higher clearance level",
    description: "Your account's clearance level is below what this resource requires.",
  },
  department_mismatch: {
    title: "This resource is restricted to another department",
    description: "Only members of the resource's own department can access it.",
  },
  account_locked: {
    title: "Your account is locked",
    description: "This account has been locked and cannot perform any actions. Contact your tenant administrator.",
  },
  unknown_role: {
    title: "Your role could not be recognized",
    description: "The access policy doesn't recognize your account's role. Contact your tenant administrator.",
  },
};

const DEFAULT_COPY: ReasonCopy = {
  title: "Access to this resource was denied",
  description: "The policy engine determined that your account doesn't meet the requirements for this request.",
};

function ForbiddenContent() {
  const searchParams = useSearchParams();

  const reason = searchParams.get("reason");
  const resource = searchParams.get("resource");
  const action = searchParams.get("action");
  const copy = (reason && REASON_COPY[reason]) || DEFAULT_COPY;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-600" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-800">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{copy.description}</p>

        {(resource || action || reason) && (
          <div className="mt-6 space-y-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs text-slate-500">
            <div className="font-semibold uppercase tracking-wide text-slate-400">Error 403 &middot; Access Denied</div>
            {action && resource && (
              <div>
                Action: <span className="font-mono text-slate-700">{action}</span> on{" "}
                <span className="font-mono text-slate-700">{resource}</span>
              </div>
            )}
            {reason && (
              <div>
                Policy reason: <span className="font-mono text-slate-700">{reason}</span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Return to My Workspace
        </Link>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        </div>
      }
    >
      <ForbiddenContent />
    </Suspense>
  );
}

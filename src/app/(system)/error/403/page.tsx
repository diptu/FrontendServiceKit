"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Alert, Button } from "@/components/ui";

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
          <Alert variant="error" compact className="mt-6 text-left">
            <p className="font-semibold uppercase tracking-wide">Error 403 · Access Denied</p>
            {action && resource && (
              <p>Action: <code className="font-mono">{action}</code> on <code className="font-mono">{resource}</code></p>
            )}
            {reason && (
              <p>Policy reason: <code className="font-mono">{reason}</code></p>
            )}
          </Alert>
        )}

        <Link href="/" className="mt-6 block">
          <Button fullWidth>Return to My Workspace</Button>
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

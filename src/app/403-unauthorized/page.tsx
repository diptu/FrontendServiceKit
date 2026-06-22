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
  role: {
    title: "Your role doesn't have access to this workspace",
    description:
      "This area is restricted to specific roles within your organization. If you believe you should have access, ask a tenant administrator to update your role assignment.",
  },
  mfa: {
    title: "Multi-factor verification is required",
    description:
      "This workspace is locked behind administrative MFA. Verify your identity with your authenticator app before this section will unlock.",
  },
  tenant: {
    title: "This workspace belongs to a different organization",
    description:
      "Your account is scoped to a different tenant than the one you tried to open. Workspace data never crosses tenant boundaries.",
  },
  unauthenticated: {
    title: "Your session could not be verified",
    description: "Sign in again to continue. Your previous session may have expired or been signed out.",
  },
};

const DEFAULT_COPY: ReasonCopy = {
  title: "You don't have permission to view this page",
  description:
    "The account you're signed in with doesn't meet the access requirements for this section of the control plane.",
};

function UnauthorizedContent() {
  const searchParams = useSearchParams();

  const reason = searchParams.get("reason");
  const copy = (reason && REASON_COPY[reason]) || DEFAULT_COPY;
  // Tenant identity comes from the hostname now (see src/middleware.ts), so
  // "my workspace" is always just this same subdomain's root.
  const homeHref = "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-600" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-800">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{copy.description}</p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          Error 403 &middot; Access Denied
        </div>

        <Link
          href={homeHref}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Return to My Workspace
        </Link>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}

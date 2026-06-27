"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { buildTenantOrigin } from "@/core/tenant/hostname";

function OrganizationLockoutContent() {
  const searchParams = useSearchParams();

  const attemptedTenantId = searchParams.get("attempted");
  const homeTenantId = searchParams.get("home");

  // The user's actual tenant lives on a different subdomain than the one
  // that triggered this lockout, so this can't be a same-origin path --
  // compute it client-side only, after mount, to avoid an SSR/hydration
  // mismatch on window.location.
  const [homeHref, setHomeHref] = useState<string>("/");

  useEffect(() => {
    if (homeTenantId) {
      setHomeHref(
        buildTenantOrigin(homeTenantId, window.location.hostname, window.location.protocol, window.location.port),
      );
    }
  }, [homeTenantId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Building2 className="h-7 w-7 text-amber-600" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-800">Organization mismatch</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The workspace URL you opened doesn&apos;t belong to your organization. Each tenant&apos;s data is
          isolated, so you can&apos;t cross into another organization&apos;s workspace from your current session.
        </p>

        {attemptedTenantId && (
          <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs">
            <div className="flex justify-between gap-3">
              <span className="font-medium text-slate-400">Attempted workspace</span>
              <span className="font-mono text-slate-600">{attemptedTenantId}</span>
            </div>
            {homeTenantId && (
              <div className="flex justify-between gap-3">
                <span className="font-medium text-slate-400">Your workspace</span>
                <span className="font-mono text-slate-600">{homeTenantId}</span>
              </div>
            )}
          </div>
        )}

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

export default function OrganizationLockoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        </div>
      }
    >
      <OrganizationLockoutContent />
    </Suspense>
  );
}

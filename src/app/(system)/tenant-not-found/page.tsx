"use client";

import { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import { ROOT_DOMAIN } from "@/core/tenant/hostname";

/**
 * Shown when src/proxy.ts resolves a Host header to a subdomain or
 * custom domain that doesn't match any tenant in the registry. Distinct
 * from the bare-root-domain case, which renders the global landing page
 * (src/app/page.tsx) instead -- this page only ever appears for a
 * tenant-shaped hostname that the backend doesn't recognize.
 */
export default function TenantNotFoundPage() {
  const [attemptedHost, setAttemptedHost] = useState<string>("");

  useEffect(() => {
    setAttemptedHost(window.location.hostname);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <SearchX className="h-7 w-7 text-slate-500" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-800">
          We couldn&apos;t find that workspace
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          This address doesn&apos;t match any organization registered on NutraTenant. Double-check the
          workspace URL, or look it up from the main site.
        </p>

        {attemptedHost && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-left text-xs">
            <div className="flex justify-between gap-3">
              <span className="font-medium text-slate-400">Requested address</span>
              <span className="font-mono text-slate-600">{attemptedHost}</span>
            </div>
          </div>
        )}

        <a
          href={`https://${ROOT_DOMAIN}`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Go to NutraTenant
        </a>
      </div>
    </div>
  );
}

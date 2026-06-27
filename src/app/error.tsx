"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-7 w-7 text-amber-600" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-800">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          An unexpected error occurred. You can try again or return to the previous page.
        </p>

        {error.digest && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-left text-xs">
            <span className="font-medium text-slate-400">Error ID: </span>
            <span className="font-mono text-slate-600">{error.digest}</span>
          </div>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

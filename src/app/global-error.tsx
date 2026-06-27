"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <span className="text-2xl font-extrabold text-red-600">!</span>
            </div>

            <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-800">
              Critical application error
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              A critical error occurred in the application shell. Try reloading the page.
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

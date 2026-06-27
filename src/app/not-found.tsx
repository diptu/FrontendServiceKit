import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <FileQuestion className="h-7 w-7 text-slate-500" strokeWidth={2} />
        </div>

        <p className="mt-5 text-4xl font-extrabold tracking-tight text-slate-800">404</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-800">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The page you requested doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

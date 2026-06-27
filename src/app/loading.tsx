export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
        <p className="text-xs font-medium text-slate-400 tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

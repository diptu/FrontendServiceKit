export default function ModeratorWorkspacePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Moderator Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">
          Day-to-day moderation tools for this tenant, available to administrators and moderators.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Workspace tier: ADMIN or MODERATOR</h2>
        <p className="mt-2 text-sm text-slate-500">
          This route is gated by <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">RoleGuard</code> with{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            allowedRoles=[&quot;ADMIN&quot;, &quot;MODERATOR&quot;]
          </code>
          . No MFA requirement is enforced at this tier.
        </p>
      </div>
    </div>
  );
}

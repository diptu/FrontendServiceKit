export default function MemberWorkspacePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Member Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">
          Standard workspace available to any authenticated account confirmed inside this tenant.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Workspace tier: any authenticated role</h2>
        <p className="mt-2 text-sm text-slate-500">
          This route is gated by <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">RoleGuard</code> with{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            allowedRoles=[&quot;ADMIN&quot;, &quot;MODERATOR&quot;, &quot;MEMBER&quot;]
          </code>
          . Tenant confinement is still enforced: the active token&apos;s{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">tenant_org</code> claim must match this URL.
        </p>
      </div>
    </div>
  );
}

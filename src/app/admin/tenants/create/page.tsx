import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CreateTenantForm from "@/components/platform-admin/CreateTenantForm";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";

// TODO(auth): temporary -- same bypass as app/admin/dashboard/page.tsx, see
// that file's comment. Restore by deleting this fallback so a missing
// session renders the denial screen again.
const AUTH_GATE_DISABLED = true;

export default async function CreateTenantPage() {
  const session = (await getPlatformAdminSession()) ?? (AUTH_GATE_DISABLED ? { id: "anonymous" } : null);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">
          Access denied. A valid SUPER_ADMIN / SYSTEM_ADMIN session is required.
        </p>
      </div>
    );
  }

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId={session.id}>
      <div className="flex flex-col gap-6">
        {AUTH_GATE_DISABLED && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
            Preview mode: the SUPER_ADMIN session check is temporarily disabled, so this page is usable without
            signing in. Re-enable the gate in this file (and in app/api/admin/onboard-tenant/route.ts) before any
            real deployment.
          </div>
        )}

        <div>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/admin/dashboard" className="hover:text-slate-600">
              Tenants
            </Link>
            <span>/</span>
            <span className="text-slate-600">Create New Tenant</span>
          </p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create New Tenant</h1>
              <p className="mt-1 text-sm text-slate-500">
                Set up a new tenant organization and configure its initial settings.
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Tenants
            </Link>
          </div>
        </div>

        <CreateTenantForm />
      </div>
    </PlatformAdminShell>
  );
}

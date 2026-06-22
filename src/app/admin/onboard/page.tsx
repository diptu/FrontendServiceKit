import TenantOnboardingWizard from "@/components/admin/TenantOnboardingWizard";
import { getServerSession } from "@/core/auth/getServerSession";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";

/**
 * Top-level (not tenant-scoped) System Admin/Superuser tool -- onboarding a
 * *new* tenant can't live under app/[tenant]/... since the tenant doesn't
 * exist yet. middleware.ts only rewrites/guards tenant-subdomain hosts; on
 * the bare root domain it passes every path through untouched (see
 * src/middleware.ts's `kind === "none"` branch), so this page does its own
 * server-side check rather than relying on SecurityGuard/RoleGuard, which
 * are only wired into the [tenant]/(dashboard) tree.
 *
 * Same caveat as the API route this posts to: "System Admin/Superuser" has
 * no dedicated role tier yet, so this checks for any authenticated Admin.
 * For a real deployment, this page (and the route it calls) should sit
 * behind a genuine platform-admin auth layer, not just this check.
 */
export default async function TenantOnboardPage() {
  const claims = await getServerSession();

  if (!claims || mapClaimRoleToPolicyRole(claims.role) !== "Admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p className="text-sm text-slate-500">Only an authenticated Admin may access tenant onboarding.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <TenantOnboardingWizard />
    </div>
  );
}

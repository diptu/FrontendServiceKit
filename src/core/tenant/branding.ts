/**
 * Per-tenant display branding (logo initials, display name, accent color)
 * for chrome-less auth screens that render before AppShell/Sidebar are
 * available -- e.g. the MFA challenge. No branding backend exists yet, so
 * this ships its own mock map keyed by tenant slug (same pattern as
 * core/tenant/registry.ts's MOCK_TENANTS), with a default for any tenant
 * not in the map.
 */

export interface TenantBranding {
  displayName: string;
  logoInitials: string;
  accentClassName: string;
}

const DEFAULT_BRANDING: TenantBranding = {
  displayName: "NutraTenant IAM",
  logoInitials: "NT",
  accentClassName: "bg-indigo-600",
};

const TENANT_BRANDING: Readonly<Record<string, TenantBranding>> = {
  applecorp: { displayName: "Apple Corp", logoInitials: "AC", accentClassName: "bg-rose-600" },
  orangeteck: { displayName: "Orange Teck", logoInitials: "OT", accentClassName: "bg-orange-600" },
  bananarepublic: { displayName: "Banana Republic", logoInitials: "BR", accentClassName: "bg-amber-600" },
};

export function getTenantBranding(tenantId: string | null): TenantBranding {
  if (tenantId === null) {
    return DEFAULT_BRANDING;
  }

  return TENANT_BRANDING[tenantId] ?? DEFAULT_BRANDING;
}

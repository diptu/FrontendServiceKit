/**
 * Maps the hostname-routing tenant slug (the subdomain -- "applecorp",
 * what ends up in claims.tenant_org, the [tenant] route segment, and
 * x-tenant-id) to the canonical tenant key used in the static mock dataset
 * (src/mock/data.json's `tenant_id` vs `subdomain` fields -- "apple_corp").
 * These are deliberately different identifiers; this is the one place that
 * bridges them for data lookups.
 */
const SUBDOMAIN_TO_TENANT_RECORD_ID: Readonly<Record<string, string>> = {
  applecorp: "apple_corp",
  orangeteck: "orange_teck",
  bananarepublic: "banana_republic",
};

export function resolvePrismaTenantId(subdomainSlug: string): string {
  return SUBDOMAIN_TO_TENANT_RECORD_ID[subdomainSlug] ?? subdomainSlug;
}

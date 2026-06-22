/**
 * Maps the hostname-routing tenant slug (the subdomain -- "applecorp",
 * what ends up in claims.tenant_org, the [tenant] route segment, and
 * x-tenant-id) to the canonical Prisma `Tenant.id` used as the foreign key
 * on every other table ("apple_corp" -- see src/mock/data.json's tenant_id
 * vs subdomain fields, and prisma/seed.mjs). These are deliberately
 * different identifiers; this is the one place that bridges them for
 * database queries.
 */
const SUBDOMAIN_TO_PRISMA_TENANT_ID: Readonly<Record<string, string>> = {
  applecorp: "apple_corp",
  orangeteck: "orange_teck",
  bananarepublic: "banana_republic",
};

export function resolvePrismaTenantId(subdomainSlug: string): string {
  return SUBDOMAIN_TO_PRISMA_TENANT_ID[subdomainSlug] ?? subdomainSlug;
}

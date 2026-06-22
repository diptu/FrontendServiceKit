/**
 * Temporary client-side mock for a tenant-by-email lookup. The real
 * backend has no `/auth/resolve-tenant` (or similar) endpoint yet -- this
 * stands in for it on the tenant-less global sign-in page (app/sign-in)
 * so "Sign In" has something to redirect to. Replace with a real API call
 * once that endpoint exists; this file is the one place that would change.
 *
 * Heuristic: our seeded demo users (src/mock/data.json) mostly share
 * `@example.test` regardless of tenant, so a domain-based lookup wouldn't
 * reliably distinguish them -- this matches on the tenant hint baked into
 * the seeded local-parts instead (e.g. "user1.apple_corp@example.test").
 * Returns null if no match, so callers can fall back to asking the user
 * for their workspace identifier directly.
 */
const KNOWN_TENANT_HINTS: ReadonlyArray<{ hint: string; subdomain: string }> = [
  { hint: "apple_corp", subdomain: "applecorp" },
  { hint: "applecorp", subdomain: "applecorp" },
  { hint: "orange_teck", subdomain: "orangeteck" },
  { hint: "orangeteck", subdomain: "orangeteck" },
  { hint: "banana_republic", subdomain: "bananarepublic" },
  { hint: "bananarepublic", subdomain: "bananarepublic" },
];

export function mockResolveTenantByEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const match = KNOWN_TENANT_HINTS.find(({ hint }) => normalized.includes(hint));
  return match ? match.subdomain : null;
}

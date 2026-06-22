/**
 * Edge-compatible tenant registry lookup with an in-memory cache.
 *
 * BACKEND CONTRACT (not yet implemented on the FastAPI gateway as of this
 * writing -- confirm/add this before relying on it in any environment):
 *
 *   GET {NEXT_PUBLIC_API_BASE_URL}/tenants/resolve?identifier=<slug-or-hostname>
 *   200 -> { "tenant_slug": string }
 *   404 -> unknown tenant
 *
 * `identifier` is either the subdomain slug (e.g. "applecorp") or, for a
 * fully custom domain, the exact hostname (e.g. "app.applecorp.com") --
 * see core/tenant/hostname.ts. The backend owns the actual mapping; this
 * module only caches its answer.
 *
 * LOCAL TESTING WITHOUT THE BACKEND: set NEXT_PUBLIC_MOCK_TENANT_REGISTRY=true
 * (e.g. in .env.local) to resolve against the in-memory MOCK_TENANTS seed
 * below instead of calling the FastAPI gateway. This lets the middleware's
 * parse/validate/rewrite/header flow be exercised end-to-end against
 * `applecorp.localhost:3000` etc. before the real endpoint exists. Remove the
 * env var (or unset it) to go back to hitting the real backend.
 *
 * Caching note: this Map lives in Edge function module scope, which is
 * reused across requests handled by the same warm isolate but is NOT a
 * distributed cache -- a cold isolate or a different edge location starts
 * empty. That's an accepted tradeoff to cut backend round-trips on the hot
 * path without standing up Redis/KV; revisit if registry lookups become a
 * bottleneck.
 */

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const USE_MOCK_REGISTRY = process.env.NEXT_PUBLIC_MOCK_TENANT_REGISTRY === "true";

const POSITIVE_TTL_MS = 60_000;
const NEGATIVE_TTL_MS = 15_000;

/**
 * Seed tenants for NEXT_PUBLIC_MOCK_TENANT_REGISTRY=true. Keyed by the same
 * `identifier` resolveTenantHostname() produces -- a subdomain slug, or the
 * full hostname for a custom domain -- mapped to the canonical tenant slug.
 */
const MOCK_TENANTS: Readonly<Record<string, string>> = {
  applecorp: "applecorp",
  orangeteck: "orangeteck",
  bananarepublic: "bananarepublic",
  "app.applecorp.com": "applecorp",
};

function resolveMockTenantSlug(identifier: string): string | null {
  return MOCK_TENANTS[identifier] ?? null;
}

interface CacheEntry {
  tenantSlug: string | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

interface TenantResolveResponse {
  tenant_slug: string;
}

function isTenantResolveResponse(value: unknown): value is TenantResolveResponse {
  return typeof value === "object" && value !== null && typeof (value as { tenant_slug?: unknown }).tenant_slug === "string";
}

async function fetchTenantSlug(identifier: string): Promise<string | null> {
  const url = new URL("/tenants/resolve", FASTAPI_BASE_URL);
  url.searchParams.set("identifier", identifier);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return isTenantResolveResponse(payload) ? payload.tenant_slug : null;
  } catch (error) {
    console.error("Tenant registry lookup failed", error);
    return null;
  }
}

/**
 * Resolves a hostname-derived identifier to a canonical tenant slug, or
 * `null` if it doesn't match any known tenant. Cached per identifier.
 */
export async function resolveTenant(identifier: string): Promise<string | null> {
  const cached = cache.get(identifier);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.tenantSlug;
  }

  const tenantSlug = USE_MOCK_REGISTRY ? resolveMockTenantSlug(identifier) : await fetchTenantSlug(identifier);
  const ttl = tenantSlug !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;

  cache.set(identifier, { tenantSlug, expiresAt: now + ttl });

  return tenantSlug;
}

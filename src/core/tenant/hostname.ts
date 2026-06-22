/**
 * Edge/browser-safe hostname -> tenant identifier parsing. No Node APIs --
 * runs in src/middleware.ts (Edge Runtime) and is fine to import from the
 * browser too (e.g. for display purposes), since it's pure string parsing.
 */

const DEFAULT_ROOT_DOMAIN = "nutratenant.com";

/**
 * The platform's marketing/root domain. `<slug>.${ROOT_DOMAIN}` is treated
 * as a tenant subdomain; bare `ROOT_DOMAIN` (or `www.${ROOT_DOMAIN}`) is the
 * global landing page with no tenant. Override via NEXT_PUBLIC_ROOT_DOMAIN
 * for local/staging environments.
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? DEFAULT_ROOT_DOMAIN;

function stripPort(host: string): string {
  return host.split(":")[0];
}

export type TenantHostnameResult =
  | { kind: "none" }
  | { kind: "subdomain"; identifier: string }
  | { kind: "custom-domain"; identifier: string };

/**
 * Resolves a request's `Host` header into a tenant lookup identifier.
 *
 * - `applecorp.localhost` (local dev) or `applecorp.${ROOT_DOMAIN}` (prod)
 *   -> { kind: "subdomain", identifier: "applecorp" }
 * - bare `localhost`, bare `${ROOT_DOMAIN}`, or `www.${ROOT_DOMAIN}`
 *   -> { kind: "none" } (global landing page, no tenant)
 * - anything else (a fully custom domain mapped to a tenant, e.g.
 *   "app.applecorp.com") -> { kind: "custom-domain", identifier: <hostname> },
 *   letting the registry resolve the mapping by exact hostname.
 */
export function resolveTenantHostname(rawHost: string | null): TenantHostnameResult {
  if (!rawHost) {
    return { kind: "none" };
  }

  const host = stripPort(rawHost).toLowerCase();

  if (host === "localhost" || host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return { kind: "none" };
  }

  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    return slug.length > 0 ? { kind: "subdomain", identifier: slug } : { kind: "none" };
  }

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = host.slice(0, -(`.${ROOT_DOMAIN}`.length));
    if (slug.length > 0 && slug !== "www") {
      return { kind: "subdomain", identifier: slug };
    }
    return { kind: "none" };
  }

  return { kind: "custom-domain", identifier: host };
}

/**
 * Builds the absolute origin URL for a given tenant slug, preserving the
 * current protocol/port (so it works against both `*.localhost:3000` in
 * dev and `*.${ROOT_DOMAIN}` in production). Pass parts from
 * `window.location` -- this function itself touches no browser globals.
 */
export function buildTenantOrigin(
  tenantSlug: string,
  currentHostname: string,
  protocol: string,
  port: string,
): string {
  const baseDomain = currentHostname === "localhost" || currentHostname.endsWith(".localhost") ? "localhost" : ROOT_DOMAIN;
  const portSuffix = port.length > 0 ? `:${port}` : "";

  return `${protocol}//${tenantSlug}.${baseDomain}${portSuffix}`;
}

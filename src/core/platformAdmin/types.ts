/**
 * Platform-admin claims shape. Deliberately separate from
 * core/auth/authService.ts's JWTClaims -- that type is tenant-scoped
 * (sub, tenant_org, role: ADMIN|MODERATOR|MEMBER); this is a cross-tenant
 * "god mode" console for the platform itself, with its own discriminating
 * fields (role: SUPER_ADMIN, user_type: SYSTEM_ADMIN) and no tenant_org at
 * all. Two parallel, independent auth surfaces rather than one stretched
 * to cover both.
 */
export const PLATFORM_ADMIN_TOKEN_COOKIE_NAME = "access_token";

export interface PlatformAdminClaims {
  id: string;
  role: "SUPER_ADMIN";
  user_type: "SYSTEM_ADMIN";
  exp?: number;
}

export function isPlatformAdminClaims(value: unknown): value is PlatformAdminClaims {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    candidate.role === "SUPER_ADMIN" &&
    candidate.user_type === "SYSTEM_ADMIN" &&
    (candidate.exp === undefined || typeof candidate.exp === "number")
  );
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binaryString = atob(padded);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Isomorphic decode (global `atob`, no `window.` prefix -- same approach
 * as core/auth/edgeJwt.ts) so this works from a Server Component, Route
 * Handler, or the browser alike. No signature verification: same
 * trust-boundary caveat as everywhere else in this app (see CLAUDE.md) --
 * there's no signing key on the frontend, so this is UX/routing only.
 */
export function decodePlatformAdminToken(token: string): PlatformAdminClaims | null {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(decodeBase64Url(segments[1]));

    if (!isPlatformAdminClaims(payload)) {
      return null;
    }

    if (payload.exp !== undefined && payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

const DEFAULT_SESSION_TTL_SECONDS = 24 * 60 * 60;

/**
 * Client-side cookie write, used by app/sign-in after a real login response
 * indicates `is_superadmin: true` (see core/auth/authService.ts's
 * setAccessTokenCookie for the tenant-side equivalent). Host-only (no
 * Domain widening) is fine here -- app/sign-in and app/admin/dashboard are
 * both on the bare root domain already, no cross-subdomain hop needed.
 *
 * Plain `document.cookie`, not a Server Action + `httpOnly` cookie --
 * deliberate, same reasoning as the tenant-side cookie: getPlatformAdminSessionFromCookie()
 * below decodes this client-side for app/sign-in's "already logged in"
 * check, which `httpOnly` would block.
 */
export function setPlatformAdminSessionCookie(accessToken: string, claims: PlatformAdminClaims): void {
  const expiresAt = claims.exp ?? Math.floor(Date.now() / 1000) + DEFAULT_SESSION_TTL_SECONDS;
  const maxAge = Math.max(expiresAt - Math.floor(Date.now() / 1000), 0);
  const securePart = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${PLATFORM_ADMIN_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${securePart}`;
}

/** Client-side read, for app/sign-in's "already logged in as platform admin" mount check. */
export function getPlatformAdminSessionFromCookie(): PlatformAdminClaims | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${PLATFORM_ADMIN_TOKEN_COOKIE_NAME}=([^;]*)`));

  if (!match) {
    return null;
  }

  return decodePlatformAdminToken(decodeURIComponent(match[1]));
}

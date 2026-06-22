import { ROOT_DOMAIN } from "@/core/tenant/hostname";

export interface JWTClaims {
  sub: string;
  name: string;
  tenant_org: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  is_mfa_verified: boolean;
  exp: number;
  current_balance?: number;
  scopes?: string[];
  /** ABAC attributes consumed by the Policy Decision Point (core/policy). Optional since not every issued token carries them yet. */
  clearance?: number;
  department?: string;
  account_locked?: boolean;
}

const ACCESS_TOKEN_STORAGE_KEY = "nutratenant_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "nutratenant_refresh_token";

/**
 * Mirrors the access token (sessionStorage is the source of truth for it)
 * into a same-name, JS-readable cookie so the Edge middleware can see it.
 * Middleware has no access to sessionStorage. This is a UX/routing signal
 * only -- the cookie is forgeable client-side since nothing here verifies
 * the JWT signature, so it must never be treated as a security boundary.
 * Real tenant/role authorization lives at the FastAPI gateway.
 */
const ACCESS_TOKEN_COOKIE_NAME = ACCESS_TOKEN_STORAGE_KEY;

const VALID_ROLES: ReadonlySet<JWTClaims["role"]> = new Set(["ADMIN", "MODERATOR", "MEMBER"]);

export function isJWTClaims(value: unknown): value is JWTClaims {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.sub === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.tenant_org === "string" &&
    typeof candidate.role === "string" &&
    VALID_ROLES.has(candidate.role as JWTClaims["role"]) &&
    typeof candidate.is_mfa_verified === "boolean" &&
    typeof candidate.exp === "number" &&
    (candidate.current_balance === undefined || typeof candidate.current_balance === "number") &&
    (candidate.scopes === undefined ||
      (Array.isArray(candidate.scopes) && candidate.scopes.every((scope) => typeof scope === "string"))) &&
    (candidate.clearance === undefined || typeof candidate.clearance === "number") &&
    (candidate.department === undefined || typeof candidate.department === "string") &&
    (candidate.account_locked === undefined || typeof candidate.account_locked === "boolean")
  );
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(paddingNeeded);

  const binaryString = window.atob(padded);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder("utf-8").decode(bytes);
}

export function decodeJwtClaims(token: string): JWTClaims | null {
  if (typeof window === "undefined") {
    return null;
  }

  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  try {
    const payloadJson = decodeBase64Url(segments[1]);
    const parsedPayload: unknown = JSON.parse(payloadJson);

    if (!isJWTClaims(parsedPayload)) {
      return null;
    }

    return parsedPayload;
  } catch (error) {
    console.error("Failed to decode JWT claims payload", error);
    return null;
  }
}

export function isClaimsExpired(claims: JWTClaims): boolean {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return claims.exp <= nowInSeconds;
}

/**
 * The cookie's Domain attribute, widened to the parent domain so it's
 * readable from every subdomain (including the bare root domain's
 * app/sign-in) -- not just the one that set it. Browsers only allow a
 * Domain attribute equal to the current host or one of its parents, so a
 * custom domain (neither *.localhost nor *.${ROOT_DOMAIN}) falls back to
 * host-only (no Domain attribute) since there's no shared parent to widen to.
 */
function rootCookieDomain(hostname: string): string | null {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return "localhost";
  }

  if (hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return `.${ROOT_DOMAIN}`;
  }

  return null;
}

function setAccessTokenCookie(accessToken: string, claims: JWTClaims): void {
  const secondsUntilExpiry = claims.exp - Math.floor(Date.now() / 1000);
  const maxAge = Math.max(secondsUntilExpiry, 0);
  const securePart = window.location.protocol === "https:" ? "; Secure" : "";
  const domain = rootCookieDomain(window.location.hostname);
  const domainPart = domain ? `; Domain=${domain}` : "";

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/${domainPart}; Max-Age=${maxAge}; SameSite=Lax${securePart}`;
}

function clearAccessTokenCookie(): void {
  const domain = rootCookieDomain(window.location.hostname);
  const domainPart = domain ? `; Domain=${domain}` : "";

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${domainPart}; Path=/; Max-Age=0; SameSite=Lax`;
}

function getAccessTokenFromCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function processLoginResponse(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);

  const decodedClaims = decodeJwtClaims(accessToken);

  if (decodedClaims) {
    setAccessTokenCookie(accessToken, decodedClaims);
  }
}

/**
 * sessionStorage is the source of truth but is never shared across
 * subdomains -- unlike the cookie (now domain-wide, see
 * rootCookieDomain). After a cross-subdomain redirect (e.g. from the root
 * app/sign-in page to a tenant's own subdomain), sessionStorage on the new
 * origin starts empty even though a valid session exists; this falls back
 * to the cookie and hydrates sessionStorage from it on first read, so
 * every other call site keeps reading from sessionStorage as before.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionToken = window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (sessionToken) {
    return sessionToken;
  }

  const cookieToken = getAccessTokenFromCookie();

  if (cookieToken) {
    window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, cookieToken);
  }

  return cookieToken;
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  clearAccessTokenCookie();
}

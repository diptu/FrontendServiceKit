import { isJWTClaims, type JWTClaims } from "./authService";

function decodeBase64UrlEdge(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(paddingNeeded);

  const binaryString = atob(padded);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Edge Runtime-safe JWT payload reader for src/middleware.ts (no `window`,
 * no Node Buffer -- only the Web APIs the Edge runtime provides).
 *
 * This performs NO signature verification: the frontend has no access to
 * the backend's signing key, so these claims are forgeable by anyone who
 * can set the access-token cookie. Use the result only to decide which
 * route/redirect to render -- never as proof of identity or authorization.
 * The FastAPI gateway remains the actual authority for tenant/role checks.
 */
export function decodeJwtClaimsEdge(token: string): JWTClaims | null {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  try {
    const payloadJson = decodeBase64UrlEdge(segments[1]);
    const parsedPayload: unknown = JSON.parse(payloadJson);

    if (!isJWTClaims(parsedPayload)) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

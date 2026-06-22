import { cookies } from "next/headers";
import { isClaimsExpired, type JWTClaims } from "./authService";
import { decodeJwtClaimsEdge } from "./edgeJwt";

const ACCESS_TOKEN_COOKIE_NAME = "nutratenant_access_token";

/**
 * Server Component-safe session read. Uses decodeJwtClaimsEdge rather than
 * authService's decodeJwtClaims, which deliberately returns null outside
 * the browser -- sessionStorage (its source of truth) doesn't exist
 * server-side, so the access-token cookie mirror is the only copy of the
 * JWT a Server Component can see. Same trust-boundary caveat as
 * middleware.ts: decoded, not signature-verified.
 */
export async function getServerSession(): Promise<JWTClaims | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  const claims = decodeJwtClaimsEdge(accessToken);

  if (!claims || isClaimsExpired(claims)) {
    return null;
  }

  return claims;
}

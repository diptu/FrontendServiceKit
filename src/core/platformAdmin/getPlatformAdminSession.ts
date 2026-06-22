import { cookies } from "next/headers";
import { PLATFORM_ADMIN_TOKEN_COOKIE_NAME, decodePlatformAdminToken, type PlatformAdminClaims } from "./types";

/**
 * Server-only platform-admin session read (Server Components / Route
 * Handlers only -- uses next/headers). Reads the same `access_token`
 * cookie name app/admin/dashboard's logout button clears.
 */
export async function getPlatformAdminSession(): Promise<PlatformAdminClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLATFORM_ADMIN_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return decodePlatformAdminToken(token);
}

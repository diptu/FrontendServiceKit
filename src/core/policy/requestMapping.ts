import type { PolicyAction } from "./types";

/**
 * Maps a (tenant-stripped) request pathname to the PDP resource type it
 * represents. Ordered longest/most-specific prefix first; anything that
 * doesn't match a known dashboard section falls back to "documents" -- the
 * lowest-privilege resource (granted READ at every role tier, see
 * policySchema.json) -- so unmapped routes degrade to "visible to anyone
 * logged into the tenant" rather than silently 403ing on app sections this
 * mapping hasn't been taught about yet.
 */
const PATH_RESOURCE_MAP: ReadonlyArray<readonly [prefix: string, resourceType: string]> = [
  ["/audit-logs", "audit_logs"],
  ["/policies", "policies"],
  ["/users", "users"],
  ["/admin", "users"],
  ["/moderator", "documents"],
  ["/member", "documents"],
  ["/documents", "documents"],
];

const DEFAULT_RESOURCE_TYPE = "documents";

export function mapPathToResourceType(pathname: string): string {
  const match = PATH_RESOURCE_MAP.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? match[1] : DEFAULT_RESOURCE_TYPE;
}

const METHOD_ACTION_MAP: Readonly<Record<string, PolicyAction>> = {
  GET: "READ",
  HEAD: "READ",
  POST: "WRITE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

export function mapMethodToAction(method: string): PolicyAction {
  return METHOD_ACTION_MAP[method.toUpperCase()] ?? "READ";
}

/**
 * JWTClaims.role is uppercase ("ADMIN" | "MODERATOR" | "MEMBER") -- the auth
 * domain's own convention, used pervasively by RoleGuard/AllowedFor/etc.
 * policySchema.json's roleHierarchy uses Title-case ("Admin", "Moderator",
 * "Member", "User") to match the mock user dataset (src/mock/data.json) and
 * its broader role set. This adapts a claim's role into the PDP's casing
 * rather than changing either side to match the other.
 */
const CLAIM_ROLE_TO_POLICY_ROLE: Readonly<Record<string, string>> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  MEMBER: "Member",
};

export function mapClaimRoleToPolicyRole(role: string): string {
  return CLAIM_ROLE_TO_POLICY_ROLE[role] ?? role;
}

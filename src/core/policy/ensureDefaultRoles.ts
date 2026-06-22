import policySchemaJson from "./policySchema.json";
import type { PolicySchema } from "./types";

const POLICY_SCHEMA = policySchemaJson as PolicySchema;

export const DEFAULT_TENANT_ROLES = ["Admin", "Moderator", "Member", "User"] as const;

/**
 * Roles in this system are a single global vocabulary defined in
 * policySchema.json's roleHierarchy (core/policy/PolicyDecisionPoint.ts),
 * not a per-tenant database table -- there is no per-tenant "create role"
 * row to insert during onboarding. This asserts the shared schema already
 * defines the four standard tiers before a new tenant namespace is
 * considered initialized, so onboarding fails loudly if that assumption
 * is ever broken instead of silently letting an unrecognized role through.
 */
export function ensureDefaultRolesAvailable(): void {
  const missing = DEFAULT_TENANT_ROLES.filter((role) => !POLICY_SCHEMA.roleHierarchy.includes(role));

  if (missing.length > 0) {
    throw new Error(`policySchema.json is missing default role tier(s): ${missing.join(", ")}`);
  }
}

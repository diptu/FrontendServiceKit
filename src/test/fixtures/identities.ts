import type { AuthorizationResource, AuthorizationSubject } from "@/core/policy/types";

/**
 * Shared ABAC test fixtures: one identity per role tier for each of the
 * three mock tenants (src/mock/data.json), so the test
 * matrix in PolicyDecisionPoint.test.ts and AuthorizationContext.test.tsx
 * doesn't each invent its own ad hoc subjects.
 */
export const TENANT_IDS = {
  appleCorp: "apple_corp",
  orangeTeck: "orange_teck",
  bananaRepublic: "banana_republic",
} as const;

export type TenantId = (typeof TENANT_IDS)[keyof typeof TENANT_IDS];

export function buildSubject(overrides: Partial<AuthorizationSubject> = {}): AuthorizationSubject {
  return {
    id: "fixture-user",
    tenant_id: TENANT_IDS.appleCorp,
    role: "Member",
    clearance: 2,
    department: "Engineering",
    mfa_verified: true,
    account_locked: false,
    ...overrides,
  };
}

export function buildResource(overrides: Partial<AuthorizationResource> = {}): AuthorizationResource {
  return {
    type: "documents",
    tenant_id: TENANT_IDS.appleCorp,
    ...overrides,
  };
}

export const APPLE_CORP_ADMIN: AuthorizationSubject = buildSubject({
  id: "apple-admin",
  tenant_id: TENANT_IDS.appleCorp,
  role: "Admin",
  clearance: 5,
  department: "Executive Operations",
});

export const APPLE_CORP_MODERATOR: AuthorizationSubject = buildSubject({
  id: "apple-moderator",
  tenant_id: TENANT_IDS.appleCorp,
  role: "Moderator",
  clearance: 4,
  department: "IT Security",
});

export const APPLE_CORP_MEMBER: AuthorizationSubject = buildSubject({
  id: "apple-member",
  tenant_id: TENANT_IDS.appleCorp,
  role: "Member",
  clearance: 2,
  department: "Engineering",
});

export const APPLE_CORP_USER: AuthorizationSubject = buildSubject({
  id: "apple-user",
  tenant_id: TENANT_IDS.appleCorp,
  role: "User",
  clearance: 1,
  department: "Customer Success",
});

export const ORANGE_TECK_ADMIN: AuthorizationSubject = buildSubject({
  id: "orange-admin",
  tenant_id: TENANT_IDS.orangeTeck,
  role: "Admin",
  clearance: 5,
  department: "Operations",
});

export const ORANGE_TECK_MEMBER: AuthorizationSubject = buildSubject({
  id: "orange-member",
  tenant_id: TENANT_IDS.orangeTeck,
  role: "Member",
  clearance: 2,
  department: "Sales",
});

export const BANANA_REPUBLIC_MODERATOR: AuthorizationSubject = buildSubject({
  id: "banana-moderator",
  tenant_id: TENANT_IDS.bananaRepublic,
  role: "Moderator",
  clearance: 4,
  department: "Finance",
});

export const BANANA_REPUBLIC_USER: AuthorizationSubject = buildSubject({
  id: "banana-user",
  tenant_id: TENANT_IDS.bananaRepublic,
  role: "User",
  clearance: 1,
  department: "Marketing",
});

export const ALL_FIXTURE_SUBJECTS: readonly AuthorizationSubject[] = [
  APPLE_CORP_ADMIN,
  APPLE_CORP_MODERATOR,
  APPLE_CORP_MEMBER,
  APPLE_CORP_USER,
  ORANGE_TECK_ADMIN,
  ORANGE_TECK_MEMBER,
  BANANA_REPUBLIC_MODERATOR,
  BANANA_REPUBLIC_USER,
];

import { describe, expect, it } from "vitest";
import { PolicyDecisionPoint } from "./PolicyDecisionPoint";
import {
  ALL_FIXTURE_SUBJECTS,
  APPLE_CORP_ADMIN,
  APPLE_CORP_MEMBER,
  APPLE_CORP_MODERATOR,
  APPLE_CORP_USER,
  BANANA_REPUBLIC_MODERATOR,
  BANANA_REPUBLIC_USER,
  buildResource,
  buildSubject,
  ORANGE_TECK_ADMIN,
  ORANGE_TECK_MEMBER,
  TENANT_IDS,
} from "@/test/fixtures/identities";

const pdp = new PolicyDecisionPoint();

describe("PolicyDecisionPoint: Cross-Tenant Separation", () => {
  it.each(
    ALL_FIXTURE_SUBJECTS.flatMap((subject) =>
      Object.values(TENANT_IDS)
        .filter((tenantId) => tenantId !== subject.tenant_id)
        .map((otherTenantId) => [subject, otherTenantId] as const),
    ),
  )("denies %s (tenant %s) acting on a resource owned by tenant %s, regardless of role/clearance", (subject, otherTenantId) => {
    const resource = buildResource({ type: "documents", tenant_id: otherTenantId });

    const decision = pdp.evaluate({ subject, resource, action: "READ" });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("tenant_isolation_violation");
  });

  it("denies cross-tenant access even for the most privileged identity (Admin, clearance 5) on every action", () => {
    const foreignResource = buildResource({ type: "audit_logs", tenant_id: TENANT_IDS.orangeTeck });

    for (const action of ["READ", "WRITE", "UPDATE", "DELETE"] as const) {
      const decision = pdp.evaluate({ subject: APPLE_CORP_ADMIN, resource: foreignResource, action });
      expect(decision).toEqual({ allowed: false, reason: "tenant_isolation_violation" });
    }
  });

  it("never falls through to an allow when tenant_id mismatches, even if the resource type is unknown to the schema", () => {
    const decision = pdp.evaluate({
      subject: APPLE_CORP_ADMIN,
      resource: buildResource({ type: "totally-unmodeled-resource", tenant_id: TENANT_IDS.bananaRepublic }),
      action: "READ",
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("tenant_isolation_violation");
  });
});

describe("PolicyDecisionPoint: Hierarchical Role Mapping", () => {
  it.each([
    ["User", APPLE_CORP_USER, "DELETE", "documents"],
    ["Member", APPLE_CORP_MEMBER, "DELETE", "documents"],
    ["Member", APPLE_CORP_MEMBER, "READ", "users"],
    ["Moderator", APPLE_CORP_MODERATOR, "WRITE", "users"],
    ["Moderator", APPLE_CORP_MODERATOR, "READ", "audit_logs"],
    ["User", ORANGE_TECK_MEMBER, "DELETE", "policies"],
  ] as const)("rejects %s attempting administrative action %s on %s", (_label, subject, action, resourceType) => {
    const resource = buildResource({ type: resourceType, tenant_id: subject.tenant_id });

    const decision = pdp.evaluate({ subject, resource, action });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("role_not_permitted");
  });

  it("grants Admin actions that are only explicitly listed for Admin (no inheritance needed)", () => {
    const decision = pdp.evaluate({
      subject: APPLE_CORP_ADMIN,
      resource: buildResource({ type: "audit_logs", tenant_id: TENANT_IDS.appleCorp }),
      action: "READ",
    });

    expect(decision).toEqual({ allowed: true, reason: "policy_satisfied" });
  });

  it("grants Admin actions inherited from lower tiers (READ documents is only listed under User)", () => {
    const decision = pdp.evaluate({
      subject: APPLE_CORP_ADMIN,
      resource: buildResource({ type: "documents", tenant_id: TENANT_IDS.appleCorp }),
      action: "READ",
    });

    expect(decision.allowed).toBe(true);
  });

  it("grants Moderator the Member-tier WRITE on documents it inherits, but not Admin-only DELETE", () => {
    const allowed = pdp.evaluate({
      subject: APPLE_CORP_MODERATOR,
      resource: buildResource({ type: "documents", tenant_id: TENANT_IDS.appleCorp }),
      action: "WRITE",
    });
    const denied = pdp.evaluate({
      subject: APPLE_CORP_MODERATOR,
      resource: buildResource({ type: "documents", tenant_id: TENANT_IDS.appleCorp }),
      action: "DELETE",
    });

    expect(allowed.allowed).toBe(true);
    expect(denied).toEqual({ allowed: false, reason: "role_not_permitted" });
  });

  it("rejects an unrecognized role outright", () => {
    const decision = pdp.evaluate({
      subject: buildSubject({ role: "Intern", tenant_id: TENANT_IDS.appleCorp }),
      resource: buildResource({ type: "documents", tenant_id: TENANT_IDS.appleCorp }),
      action: "READ",
    });

    expect(decision).toEqual({ allowed: false, reason: "unknown_role" });
  });
});

describe("PolicyDecisionPoint: Attribute-Based Conditions (clearance + department bounds)", () => {
  it("denies with insufficient_clearance when role permits the action but clearance is one below the requirement", () => {
    const decision = pdp.evaluate({
      subject: buildSubject({ role: "Admin", clearance: 4, tenant_id: TENANT_IDS.appleCorp }),
      resource: buildResource({ type: "audit_logs", clearance_required: 5, tenant_id: TENANT_IDS.appleCorp }),
      action: "READ",
    });

    expect(decision).toEqual({ allowed: false, reason: "insufficient_clearance" });
  });

  it("allows when clearance is exactly equal to the requirement (inclusive boundary)", () => {
    const decision = pdp.evaluate({
      subject: buildSubject({ role: "Admin", clearance: 5, tenant_id: TENANT_IDS.appleCorp }),
      resource: buildResource({ type: "audit_logs", clearance_required: 5, tenant_id: TENANT_IDS.appleCorp }),
      action: "READ",
    });

    expect(decision.allowed).toBe(true);
  });

  it("honors an explicit per-resource clearance_required over the schema default", () => {
    const lowClearanceSubject = buildSubject({ role: "Member", clearance: 1, tenant_id: TENANT_IDS.appleCorp });
    const highClearanceDocument = buildResource({
      type: "documents",
      tenant_id: TENANT_IDS.appleCorp,
      clearance_required: 4,
    });

    const decision = pdp.evaluate({ subject: lowClearanceSubject, resource: highClearanceDocument, action: "READ" });

    expect(decision).toEqual({ allowed: false, reason: "insufficient_clearance" });
  });

  it("denies with department_mismatch when matching tenant + sufficient clearance but the resource is scoped to a different department", () => {
    const decision = pdp.evaluate({
      subject: buildSubject({
        role: "Moderator",
        clearance: 4,
        department: "Engineering",
        tenant_id: TENANT_IDS.bananaRepublic,
      }),
      resource: buildResource({
        type: "documents",
        tenant_id: TENANT_IDS.bananaRepublic,
        department: "Finance",
        clearance_required: 1,
      }),
      action: "READ",
    });

    expect(decision).toEqual({ allowed: false, reason: "department_mismatch" });
  });

  it("allows when department matches and clearance is sufficient", () => {
    const decision = pdp.evaluate({
      subject: BANANA_REPUBLIC_MODERATOR, // department: Finance, clearance 4
      resource: buildResource({
        type: "documents",
        tenant_id: TENANT_IDS.bananaRepublic,
        department: "Finance",
        clearance_required: 4,
      }),
      action: "WRITE",
    });

    expect(decision.allowed).toBe(true);
  });

  it("does not apply a department condition when the resource declares no department", () => {
    const decision = pdp.evaluate({
      subject: BANANA_REPUBLIC_USER, // department: Marketing
      resource: buildResource({ type: "documents", tenant_id: TENANT_IDS.bananaRepublic }),
      action: "READ",
    });

    expect(decision.allowed).toBe(true);
  });

  it("treats a locked account as a hard stop ahead of every other check, even with full clearance and matching tenant/department", () => {
    const decision = pdp.evaluate({
      subject: buildSubject({
        role: "Admin",
        clearance: 5,
        department: "Executive Operations",
        account_locked: true,
        tenant_id: TENANT_IDS.appleCorp,
      }),
      resource: buildResource({ type: "documents", tenant_id: TENANT_IDS.appleCorp }),
      action: "READ",
    });

    expect(decision).toEqual({ allowed: false, reason: "account_locked" });
  });
});

describe("PolicyDecisionPoint: individual check methods are independently unit-testable", () => {
  it("checkTenantIsolation reports satisfied/violated independent of role or clearance", () => {
    expect(pdp.checkTenantIsolation({ subject: APPLE_CORP_ADMIN, resource: buildResource({ tenant_id: TENANT_IDS.appleCorp }), action: "READ" }).allowed).toBe(true);
    expect(pdp.checkTenantIsolation({ subject: APPLE_CORP_ADMIN, resource: buildResource({ tenant_id: TENANT_IDS.orangeTeck }), action: "READ" }).allowed).toBe(false);
  });

  it("checkRolePermission reports role_not_permitted/role_permitted independent of tenant/clearance", () => {
    expect(pdp.checkRolePermission({ subject: ORANGE_TECK_ADMIN, resource: buildResource({ type: "users" }), action: "DELETE" }).allowed).toBe(true);
    expect(pdp.checkRolePermission({ subject: ORANGE_TECK_MEMBER, resource: buildResource({ type: "users" }), action: "DELETE" }).allowed).toBe(false);
  });

  it("checkAttributeConditions reports insufficient_clearance/department_mismatch independent of tenant/role", () => {
    expect(
      pdp.checkAttributeConditions({
        subject: buildSubject({ clearance: 1 }),
        resource: buildResource({ clearance_required: 3 }),
        action: "READ",
      }).allowed,
    ).toBe(false);
  });
});

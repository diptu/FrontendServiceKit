import policySchemaJson from "./policySchema.json";
import type { AuthorizationContext, PolicyDecision, PolicySchema } from "./types";

const POLICY_SCHEMA = policySchemaJson as PolicySchema;

/**
 * In-app Policy Decision Point (PDP): pure evaluation of an
 * AuthorizationContext against the declarative schema in policySchema.json.
 * No I/O, no framework dependencies -- every method is unit-testable in
 * isolation. This is the decision engine only; src/middleware.ts (the Policy
 * Enforcement Point) is responsible for building the context and acting on
 * the decision.
 *
 * Trust-boundary caveat (same as every other guard in this codebase, see
 * CLAUDE.md): subject attributes ultimately come from an unverified,
 * client-decoded JWT, so this is a UX/defense-in-depth layer, not the real
 * authorization boundary -- the FastAPI gateway remains the actual authority.
 */
export class PolicyDecisionPoint {
  constructor(private readonly schema: PolicySchema = POLICY_SCHEMA) {}

  /**
   * Runs every check in order and returns the first denial, or an allow once
   * all checks pass. `account_locked` is a hard stop checked ahead of the
   * three required checks below -- a locked account should never reach role
   * or attribute evaluation regardless of what it asks for.
   */
  evaluate(context: AuthorizationContext): PolicyDecision {
    if (context.subject.account_locked) {
      return { allowed: false, reason: "account_locked" };
    }

    const tenantIsolation = this.checkTenantIsolation(context);
    if (!tenantIsolation.allowed) {
      return tenantIsolation;
    }

    const rolePermission = this.checkRolePermission(context);
    if (!rolePermission.allowed) {
      return rolePermission;
    }

    const attributeConditions = this.checkAttributeConditions(context);
    if (!attributeConditions.allowed) {
      return attributeConditions;
    }

    return { allowed: true, reason: "policy_satisfied" };
  }

  /** Requirement 1: Tenant Isolation -- a subject may never act on another tenant's resource. */
  checkTenantIsolation(context: AuthorizationContext): PolicyDecision {
    if (context.subject.tenant_id !== context.resource.tenant_id) {
      return { allowed: false, reason: "tenant_isolation_violation" };
    }

    return { allowed: true, reason: "tenant_isolation_satisfied" };
  }

  /**
   * Requirement 2: Hierarchical Role Mapping. `roleHierarchy` orders roles
   * from least to most privileged; a role inherits every permission granted
   * to the roles ranked below it, so a higher role's effective permission
   * set for a resource type is the union of its own entry in
   * `rolePermissions` plus every lower role's entry. This keeps the schema
   * DRY -- Admin's JSON entry only needs to list what Admin adds on top of
   * Moderator/Member/User, not repeat their permissions too.
   */
  checkRolePermission(context: AuthorizationContext): PolicyDecision {
    const subjectRank = this.schema.roleHierarchy.indexOf(context.subject.role);

    if (subjectRank === -1) {
      return { allowed: false, reason: "unknown_role" };
    }

    const effectivePermissions = new Set<string>();

    for (let rank = 0; rank <= subjectRank; rank += 1) {
      const roleName = this.schema.roleHierarchy[rank];
      const actionsForResource = this.schema.rolePermissions[roleName]?.[context.resource.type] ?? [];

      for (const action of actionsForResource) {
        effectivePermissions.add(action);
      }
    }

    if (!effectivePermissions.has(context.action)) {
      return { allowed: false, reason: "role_not_permitted" };
    }

    return { allowed: true, reason: "role_permitted" };
  }

  /**
   * Requirement 3: Attribute-Based Conditions. Evaluates an array of
   * independent boolean ABAC checks -- clearance and (only when the resource
   * declares one) department match -- and requires every entry to pass.
   */
  checkAttributeConditions(context: AuthorizationContext): PolicyDecision {
    const requiredClearance =
      context.resource.clearance_required ?? this.schema.resourceClearanceDefaults[context.resource.type] ?? 1;

    const conditions: ReadonlyArray<{ passed: boolean; reason: string }> = [
      {
        passed: context.subject.clearance >= requiredClearance,
        reason: "insufficient_clearance",
      },
      {
        passed: context.resource.department === undefined || context.subject.department === context.resource.department,
        reason: "department_mismatch",
      },
    ];

    const failedCondition = conditions.find((condition) => !condition.passed);

    if (failedCondition) {
      return { allowed: false, reason: failedCondition.reason };
    }

    return { allowed: true, reason: "attribute_conditions_satisfied" };
  }
}

export const policyDecisionPoint = new PolicyDecisionPoint();

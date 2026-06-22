export type PolicyAction = "READ" | "WRITE" | "UPDATE" | "DELETE" | "LOGIN";

export interface AuthorizationSubject {
  id: string;
  tenant_id: string;
  role: string;
  clearance: number;
  department?: string;
  mfa_verified: boolean;
  account_locked: boolean;
}

export interface AuthorizationResource {
  type: string;
  tenant_id: string;
  clearance_required?: number;
  department?: string;
}

export interface AuthorizationEnvironment {
  ip?: string;
  timestamp?: string;
}

export interface AuthorizationContext {
  subject: AuthorizationSubject;
  resource: AuthorizationResource;
  action: PolicyAction;
  environment?: AuthorizationEnvironment;
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
}

export interface PolicySchema {
  roleHierarchy: string[];
  rolePermissions: Record<string, Partial<Record<string, PolicyAction[]>>>;
  resourceClearanceDefaults: Record<string, number>;
}

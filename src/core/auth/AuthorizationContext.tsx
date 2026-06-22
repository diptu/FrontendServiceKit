"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { policyDecisionPoint } from "@/core/policy/PolicyDecisionPoint";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";
import type { AuthorizationResource, AuthorizationSubject, PolicyAction } from "@/core/policy/types";
import { useAuth } from "./AuthContext";

export interface AuthorizationAttributes {
  tenant_id: string;
  role: string;
  clearance: number;
  department?: string;
}

export interface ResourceAttributes {
  clearance_required?: number;
  department?: string;
  tenant_id?: string;
}

export interface AuthorizationContextType {
  /** Current user's ABAC attribute snapshot, or null if unauthenticated. */
  attributes: AuthorizationAttributes | null;
  can: (action: string, resourceType: string, resourceAttributes?: ResourceAttributes) => boolean;
}

const AuthorizationReactContext = createContext<AuthorizationContextType | undefined>(undefined);

/**
 * Client-side mirror of core/policy/PolicyDecisionPoint -- same PDP
 * instance, same policySchema.json, so there is exactly one place the
 * actual rules live; this just gives client components a synchronous,
 * no-roundtrip way to ask it questions for UI gating (show/hide a button,
 * a nav group, a tab). Same trust-boundary caveat as everywhere else: this
 * is for UX, not enforcement -- the real check happens server-side
 * (middleware.ts's PEP, and ultimately the FastAPI gateway).
 */
export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const subject: AuthorizationSubject | null = useMemo(() => {
    if (user === null) {
      return null;
    }

    return {
      id: user.sub,
      tenant_id: user.tenant_org,
      role: mapClaimRoleToPolicyRole(user.role),
      clearance: user.clearance ?? 1,
      department: user.department,
      mfa_verified: user.is_mfa_verified,
      account_locked: user.account_locked ?? false,
    };
  }, [user]);

  const can = useMemo(() => {
    return (action: string, resourceType: string, resourceAttributes?: ResourceAttributes): boolean => {
      if (subject === null) {
        return false;
      }

      const resource: AuthorizationResource = {
        type: resourceType,
        tenant_id: resourceAttributes?.tenant_id ?? subject.tenant_id,
        clearance_required: resourceAttributes?.clearance_required,
        department: resourceAttributes?.department,
      };

      return policyDecisionPoint.evaluate({ subject, resource, action: action as PolicyAction }).allowed;
    };
  }, [subject]);

  const attributes: AuthorizationAttributes | null = useMemo(() => {
    if (subject === null) {
      return null;
    }

    return {
      tenant_id: subject.tenant_id,
      role: subject.role,
      clearance: subject.clearance,
      department: subject.department,
    };
  }, [subject]);

  const value = useMemo<AuthorizationContextType>(() => ({ attributes, can }), [attributes, can]);

  return <AuthorizationReactContext.Provider value={value}>{children}</AuthorizationReactContext.Provider>;
}

export function useAuthorization(): AuthorizationContextType {
  const context = useContext(AuthorizationReactContext);

  if (context === undefined) {
    throw new Error("useAuthorization must be called within an AuthorizationProvider.");
  }

  return context;
}

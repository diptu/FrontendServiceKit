"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import type { JWTClaims } from "@/core/auth/authService";

interface AllowedForProps {
  roles?: JWTClaims["role"][];
  requiredScopes?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Phase 3, Task 3.3: declarative DOM-level ABAC visibility wrapper.
 * This is a UX layer only -- same trust-boundary caveat as RoleGuard/
 * SecurityGuard, since `user` comes from an unverified, client-decoded JWT.
 * Real authorization for whatever this guards still has to happen server-side.
 */
export default function AllowedFor({ roles, requiredScopes, fallback, children }: AllowedForProps) {
  const { user } = useAuth();

  // No auth user = preview mode (unauthenticated visitors reach here because
  // middleware bypasses JWT checks). Show everything so the full nav is visible.
  if (user === null) {
    return <>{children}</>;
  }

  if (roles !== undefined && !roles.includes(user.role)) {
    return fallback ?? null;
  }

  if (requiredScopes !== undefined) {
    const grantedScopes = user.scopes ?? [];
    const hasAllRequiredScopes = requiredScopes.every((scope) => grantedScopes.includes(scope));

    if (!hasAllRequiredScopes) {
      return fallback ?? null;
    }
  }

  return <>{children}</>;
}

"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/AuthContext";
import type { JWTClaims } from "@/core/auth/authService";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: JWTClaims["role"][];
  requireMfa?: boolean;
}

type DenialReason = "unauthenticated" | "role" | "mfa" | "tenant";

function resolveDenialReason(
  user: JWTClaims | null,
  tenant: string | null,
  allowedRoles: JWTClaims["role"][],
  requireMfa: boolean,
): DenialReason | null {
  if (user === null) {
    return "unauthenticated";
  }

  if (tenant !== null && tenant !== user.tenant_org) {
    return "tenant";
  }

  if (!allowedRoles.includes(user.role)) {
    return "role";
  }

  if (requireMfa && user.is_mfa_verified !== true) {
    return "mfa";
  }

  return null;
}

/**
 * Layout-level workspace guard (NutraTenant IAM Phase 2, Task 2.2).
 *
 * This is a UX layer, same caveat as src/middleware.ts: `user` comes from an
 * unverified, client-decoded JWT, so it is forgeable and must not be relied
 * on as the actual authorization check. Real role/tenant enforcement has to
 * happen server-side at the FastAPI gateway for every protected request.
 *
 * The `tenant` param here comes from useParams() on the *rewritten* route
 * (middleware rewrites the hostname-resolved tenant into /[tenant]/...), so
 * this tenant check is normally redundant with middleware's own JWT
 * tenant_org comparison -- it's a second layer in case this route is ever
 * reached without going through middleware's rewrite.
 */
export default function RoleGuard({ children, allowedRoles, requireMfa = false }: RoleGuardProps) {
  const router = useRouter();
  const params = useParams<{ tenant?: string }>();
  const { user, isLoading } = useAuth();

  const tenant = typeof params.tenant === "string" ? params.tenant : null;
  const denialReason = resolveDenialReason(user, tenant, allowedRoles, requireMfa);

  useEffect(() => {
    if (isLoading || denialReason === null) {
      return;
    }

    const unauthorizedUrl = new URL("/403-unauthorized", window.location.origin);
    unauthorizedUrl.searchParams.set("reason", denialReason);
    router.push(`${unauthorizedUrl.pathname}${unauthorizedUrl.search}`);
  }, [isLoading, denialReason, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  if (denialReason !== null) {
    return null;
  }

  return <>{children}</>;
}

import { NextResponse, type NextRequest } from "next/server";
import { isClaimsExpired } from "@/core/auth/authService";
import { decodeJwtClaimsEdge } from "@/core/auth/edgeJwt";
import { policyDecisionPoint } from "@/core/policy/PolicyDecisionPoint";
import { mapClaimRoleToPolicyRole, mapMethodToAction, mapPathToResourceType } from "@/core/policy/requestMapping";
import type { AuthorizationContext } from "@/core/policy/types";
import { resolveTenantHostname } from "@/core/tenant/hostname";
import { resolveTenant } from "@/core/tenant/registry";

const ACCESS_TOKEN_COOKIE_NAME = "nutratenant_access_token";
const TENANT_HEADER_NAME = "x-tenant-id";

const PUBLIC_PATHS: readonly string[] = [
  "/login",
  "/mfa",
  "/403-unauthorized",
  "/auth/organization-lockout",
  "/tenant-not-found",
  "/error/403",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`));
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToLockout(request: NextRequest, attemptedTenant: string, homeTenant: string): NextResponse {
  const lockoutUrl = new URL("/auth/organization-lockout", request.url);
  lockoutUrl.searchParams.set("attempted", attemptedTenant);
  lockoutUrl.searchParams.set("home", homeTenant);
  return NextResponse.redirect(lockoutUrl);
}

function redirectToForbidden(
  request: NextRequest,
  reason: string,
  resourceType: string,
  action: string,
): NextResponse {
  const forbiddenUrl = new URL("/error/403", request.url);
  forbiddenUrl.searchParams.set("reason", reason);
  forbiddenUrl.searchParams.set("resource", resourceType);
  forbiddenUrl.searchParams.set("action", action);
  return NextResponse.redirect(forbiddenUrl);
}

/**
 * Multi-tenant hostname routing interceptor (NutraTenant IAM Phase 2,
 * Task 2.1 -- superseding the earlier path-segment ([tenantId] in the URL)
 * implementation). Tenant identity now comes from the request's Host header
 * (subdomain or fully custom domain), not the URL path.
 *
 * NOTE on trust boundary: the JWT tenant_org check below reads an unverified,
 * client-decoded claim from a client-writable cookie -- there is no signature
 * check here (the frontend has no signing key; see CLAUDE.md). That makes
 * this a UX/defense-in-depth layer that keeps honest users out of the wrong
 * workspace, NOT a real security boundary. Real tenant/role authorization
 * must be enforced server-side by the FastAPI gateway on every request.
 *
 * Also acts as the Policy Enforcement Point (PEP) for core/policy's
 * PolicyDecisionPoint (the PDP): it builds an AuthorizationContext from the
 * same decoded-not-verified claims plus the request path/method, and routes
 * to /error/403 on denial. Same caveat applies -- this is decode-only,
 * consistent with every other guard here, not a substitute for the gateway
 * enforcing ABAC on the actual data operations.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const hostnameResult = resolveTenantHostname(request.headers.get("host"));

  if (hostnameResult.kind === "none") {
    // Bare root domain (or "www"): the global, tenant-less landing page.
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const tenantSlug = await resolveTenant(hostnameResult.identifier);

  if (tenantSlug === null) {
    // Subdomain/custom domain doesn't match any known tenant.
    return NextResponse.redirect(new URL("/tenant-not-found", request.url));
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const claims = accessToken ? decodeJwtClaimsEdge(accessToken) : null;

  if (!claims || isClaimsExpired(claims)) {
    return redirectToLogin(request);
  }

  if (claims.tenant_org !== tenantSlug) {
    return redirectToLockout(request, tenantSlug, claims.tenant_org);
  }

  // --- Policy Enforcement Point (PEP): delegate to the in-app PDP (core/policy) ---
  // Pure, synchronous, no I/O -- negligible latency added to a request that
  // already decodes a JWT and resolves a tenant on every hit.
  const resourceType = mapPathToResourceType(pathname);
  const action = mapMethodToAction(request.method);

  const authorizationContext: AuthorizationContext = {
    subject: {
      id: claims.sub,
      tenant_id: claims.tenant_org,
      role: mapClaimRoleToPolicyRole(claims.role),
      clearance: claims.clearance ?? 1,
      department: claims.department,
      mfa_verified: claims.is_mfa_verified,
      account_locked: claims.account_locked ?? false,
    },
    resource: { type: resourceType, tenant_id: tenantSlug },
    action,
    environment: {
      ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined,
      timestamp: new Date().toISOString(),
    },
  };

  const decision = policyDecisionPoint.evaluate(authorizationContext);

  if (!decision.allowed) {
    return redirectToForbidden(request, decision.reason, resourceType, action);
  }
  // --- end PEP ---

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HEADER_NAME, tenantSlug);

  const rewrittenPath = pathname === "/" ? `/${tenantSlug}` : `/${tenantSlug}${pathname}`;

  return NextResponse.rewrite(new URL(rewrittenPath, request.url), {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|static|api).*)"],
};

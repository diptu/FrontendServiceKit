import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "@/core/auth/AuthContext";
import type { JWTClaims } from "@/core/auth/authService";
import { TENANT_IDS } from "@/test/fixtures/identities";
import { AuthorizationProvider, useAuthorization, type ResourceAttributes } from "./AuthorizationContext";

// Matches authService's private ACCESS_TOKEN_STORAGE_KEY -- there's no
// export for it, but the key itself is a stable, documented constant (see
// CLAUDE.md's auth section), so it's safe to mirror here for test seeding.
const ACCESS_TOKEN_STORAGE_KEY = "nutratenant_access_token";

function encodeBase64Url(value: object): string {
  const base64 = btoa(JSON.stringify(value));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function seedSession(claims: JWTClaims): void {
  const token = `${encodeBase64Url({ alg: "HS256", typ: "JWT" })}.${encodeBase64Url(claims)}.fakesig`;
  window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

function buildClaims(overrides: Partial<JWTClaims> = {}): JWTClaims {
  return {
    sub: "test-user",
    name: "Test User",
    tenant_org: TENANT_IDS.appleCorp,
    role: "MEMBER",
    is_mfa_verified: true,
    exp: Math.floor(Date.now() / 1000) + 3600,
    clearance: 2,
    department: "Engineering",
    account_locked: false,
    ...overrides,
  };
}

interface ProbeProps {
  action: string;
  resourceType: string;
  resourceAttributes?: ResourceAttributes;
}

function Probe({ action, resourceType, resourceAttributes }: ProbeProps) {
  const { can, attributes } = useAuthorization();

  return (
    <div>
      <span data-testid="can-result">{String(can(action, resourceType, resourceAttributes))}</span>
      <span data-testid="role">{attributes?.role ?? "none"}</span>
    </div>
  );
}

function renderWithProviders(claims: JWTClaims | null, probeProps: ProbeProps) {
  if (claims) {
    seedSession(claims);
  }

  return render(
    <AuthProvider>
      <AuthorizationProvider>
        <Probe {...probeProps} />
      </AuthorizationProvider>
    </AuthProvider>,
  );
}

/**
 * useAuthorization() wraps the exact same PolicyDecisionPoint instance the
 * server-side PEP uses (see core/policy/PolicyDecisionPoint.test.ts for the
 * direct engine test matrix) -- these tests exercise it through the
 * client-side surface (AuthContext -> AuthorizationContext -> can()) to
 * confirm the mirror actually holds end-to-end, not just in isolation.
 */
describe("useAuthorization: client-side PDP mirror", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("denies everything when unauthenticated", async () => {
    renderWithProviders(null, { action: "READ", resourceType: "documents" });
    expect(await screen.findByTestId("can-result")).toHaveTextContent("false");
  });

  it("Cross-Tenant Separation: a Banana Republic admin cannot act on an Apple Corp resource", async () => {
    renderWithProviders(buildClaims({ role: "ADMIN", tenant_org: TENANT_IDS.bananaRepublic, clearance: 5 }), {
      action: "READ",
      resourceType: "documents",
      resourceAttributes: { tenant_id: TENANT_IDS.appleCorp },
    });
    expect(await screen.findByTestId("can-result")).toHaveTextContent("false");
  });

  it("Hierarchical Validation: a MEMBER cannot DELETE documents (Admin-tier action)", async () => {
    renderWithProviders(buildClaims({ role: "MEMBER", clearance: 2 }), {
      action: "DELETE",
      resourceType: "documents",
    });
    expect(await screen.findByTestId("can-result")).toHaveTextContent("false");
  });

  it("Hierarchical Validation: an ADMIN can DELETE documents", async () => {
    renderWithProviders(buildClaims({ role: "ADMIN", clearance: 5 }), {
      action: "DELETE",
      resourceType: "documents",
    });
    expect(await screen.findByTestId("can-result")).toHaveTextContent("true");
  });

  it("Attribute Bounds: matching tenant and permitted role, but insufficient clearance, still denies", async () => {
    renderWithProviders(buildClaims({ role: "ADMIN", clearance: 2 }), {
      action: "READ",
      resourceType: "audit_logs",
      resourceAttributes: { clearance_required: 5 },
    });
    expect(await screen.findByTestId("can-result")).toHaveTextContent("false");
  });
});

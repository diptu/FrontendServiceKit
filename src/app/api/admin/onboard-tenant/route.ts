import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/core/auth/getServerSession";
import { signInvitationToken } from "@/core/auth/invitationToken";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";
import { ensureDefaultRolesAvailable } from "@/core/policy/ensureDefaultRoles";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";
import { dispatchOnboardingInvitationEmail } from "@/lib/tasks/email-worker";
import mockData from "@/mock/data.json";

interface OnboardTenantRequestBody {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  plan: "starter" | "growth" | "enterprise";
  ownerEmail: string;
  ownerDepartment?: string;
  // Richer "Create New Tenant" form fields (app/admin/tenants/create) -- all
  // optional so the original 3-step wizard (app/admin/onboard) keeps working
  // unchanged.
  organizationType?: string;
  industry?: string;
  description?: string;
  ownerFullName?: string;
  password?: string;
  confirmPassword?: string;
  billingCycle?: "monthly" | "annually";
  trialEnabled?: boolean;
  trialDays?: number;
  defaultUserRole?: "Admin" | "Moderator" | "Member" | "User";
  mfaRequiredForAdmins?: boolean;
  allowUserRegistration?: boolean;
  dataRegion?: string;
  timeZone?: string;
  // Customized via SendInvitationModal on the Create Tenant page -- passed
  // straight through to the email worker, see lib/tasks/email-worker.ts.
  invitationFromName?: string;
  invitationSubject?: string;
  invitationMessage?: string;
}

const TENANT_ID_PATTERN = /^[a-z][a-z0-9_]{2,39}$/;
const SUBDOMAIN_PATTERN = /^[a-z][a-z0-9-]{2,62}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PLANS: ReadonlySet<string> = new Set(["starter", "growth", "enterprise"]);
const VALID_ROLES: ReadonlySet<string> = new Set(["Admin", "Moderator", "Member", "User"]);
const MIN_PASSWORD_LENGTH = 8;

// TODO(auth): temporary -- this route normally requires a real Admin
// session (tenant-scoped or platform). Disabled for now so the Create
// Tenant page is usable by anyone while it's being built out. Restore by
// deleting this flag and the bypass below before any real deployment.
const AUTH_GATE_DISABLED = true;

function validateOnboardTenantRequestBody(value: unknown): {
  errors: string[];
  body: OnboardTenantRequestBody | null;
} {
  if (typeof value !== "object" || value === null) {
    return { errors: ["Request body must be a JSON object."], body: null };
  }

  const candidate = value as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof candidate.tenantId !== "string" || !TENANT_ID_PATTERN.test(candidate.tenantId)) {
    errors.push('tenantId must be a lowercase slug starting with a letter, e.g. "apple_corp".');
  }

  if (typeof candidate.tenantName !== "string" || candidate.tenantName.trim().length < 2) {
    errors.push("tenantName must be at least 2 characters.");
  }

  if (typeof candidate.subdomain !== "string" || !SUBDOMAIN_PATTERN.test(candidate.subdomain)) {
    errors.push("subdomain must be a lowercase hostname label (letters, digits, hyphens only).");
  }

  if (typeof candidate.plan !== "string" || !VALID_PLANS.has(candidate.plan)) {
    errors.push(`plan must be one of: ${Array.from(VALID_PLANS).join(", ")}.`);
  }

  if (typeof candidate.ownerEmail !== "string" || !EMAIL_PATTERN.test(candidate.ownerEmail)) {
    errors.push("ownerEmail must be a valid email address.");
  }

  if (candidate.ownerDepartment !== undefined && typeof candidate.ownerDepartment !== "string") {
    errors.push("ownerDepartment must be a string.");
  }

  if (candidate.password !== undefined || candidate.confirmPassword !== undefined) {
    if (typeof candidate.password !== "string" || candidate.password.length < MIN_PASSWORD_LENGTH) {
      errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    } else if (candidate.password !== candidate.confirmPassword) {
      errors.push("password and confirmPassword must match.");
    }
  }

  if (candidate.defaultUserRole !== undefined && !VALID_ROLES.has(candidate.defaultUserRole as string)) {
    errors.push(`defaultUserRole must be one of: ${Array.from(VALID_ROLES).join(", ")}.`);
  }

  if (candidate.trialDays !== undefined && (typeof candidate.trialDays !== "number" || candidate.trialDays < 0)) {
    errors.push("trialDays must be a non-negative number.");
  }

  for (const field of ["invitationFromName", "invitationSubject", "invitationMessage"] as const) {
    if (candidate[field] !== undefined && typeof candidate[field] !== "string") {
      errors.push(`${field} must be a string.`);
    }
  }

  if (errors.length > 0) {
    return { errors, body: null };
  }

  return { errors: [], body: candidate as unknown as OnboardTenantRequestBody };
}

/**
 * Tenant onboarding (System Admin/Superuser workflow) -- STATELESS for now.
 * There's no real backend endpoint for tenant creation yet (only
 * /auth/login exists on the live gateway), and this frontend no longer
 * keeps its own database (Prisma/SQLite removed -- doesn't survive
 * Vercel's serverless filesystem anyway). So this route:
 *   1. validates the request and asserts the default role tiers exist
 *      (core/policy/ensureDefaultRoles.ts)
 *   2. checks for a collision against the known seed tenants/users
 *      (src/mock/data.json) -- NOT against anything created by a previous
 *      call to this route, since nothing is persisted between requests
 *   3. signs a short-lived invitation token (core/auth/invitationToken.ts)
 *   4. dispatches the simulated invitation email
 *   5. returns a fabricated tenant/owner payload as if it had been created
 *
 * Replace this with a real call to the backend's tenant-creation endpoint
 * once one exists -- the request/response shape here is the intended
 * contract.
 *
 * Auth note: accepts either an existing platform-admin session
 * (core/platformAdmin) or a tenant-scoped Admin session (the original
 * stand-in, kept for the older wizard) -- see AUTH_GATE_DISABLED above for
 * the current temporary bypass.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const [platformSession, tenantClaims] = await Promise.all([getPlatformAdminSession(), getServerSession()]);
  const isAuthorized =
    platformSession !== null || (tenantClaims !== null && mapClaimRoleToPolicyRole(tenantClaims.role) === "Admin");

  if (!isAuthorized && !AUTH_GATE_DISABLED) {
    return NextResponse.json({ error: "Only an authenticated Admin may onboard a new tenant." }, { status: 403 });
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { errors, body } = validateOnboardTenantRequestBody(rawBody);

  if (body === null) {
    return NextResponse.json({ error: "Validation failed.", details: errors }, { status: 400 });
  }

  try {
    ensureDefaultRolesAvailable();
  } catch (error) {
    console.error("Default role assertion failed", error);
    return NextResponse.json({ error: "Tenant role configuration is invalid." }, { status: 500 });
  }

  const existingTenant = Object.values(mockData.tenants).find(
    (tenant) => tenant.tenant_id === body.tenantId || tenant.subdomain === body.subdomain,
  );

  if (existingTenant) {
    const conflictField = existingTenant.tenant_id === body.tenantId ? "tenantId" : "subdomain";
    return NextResponse.json({ error: `A tenant with this ${conflictField} already exists.` }, { status: 409 });
  }

  const existingOwner = mockData.users.find((user) => user.email === body.ownerEmail);

  if (existingOwner) {
    return NextResponse.json({ error: "A user account with this owner email already exists." }, { status: 409 });
  }

  const tenant = {
    id: body.tenantId,
    name: body.tenantName.trim(),
    subdomain: body.subdomain,
    plan: body.plan,
  };

  const owner = {
    id: randomUUID(),
    email: body.ownerEmail,
    role: "Admin" as const,
    clearance: 5,
    accountLocked: !body.password,
  };

  const invitationToken = signInvitationToken({
    sub: owner.id,
    tenant_id: tenant.id,
    email: owner.email,
    role: "Admin",
  });

  dispatchOnboardingInvitationEmail({
    recipientEmail: owner.email,
    tenantName: tenant.name,
    invitationToken,
    fromName: body.invitationFromName,
    subject: body.invitationSubject,
    message: body.invitationMessage,
  });

  return NextResponse.json(
    {
      tenant,
      owner,
      invitationDispatched: true,
    },
    { status: 201 },
  );
}

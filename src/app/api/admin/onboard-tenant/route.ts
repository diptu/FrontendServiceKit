import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "@/core/auth/getServerSession";
import { signInvitationToken } from "@/core/auth/invitationToken";
import { getPlatformAdminSession } from "@/core/platformAdmin/getPlatformAdminSession";
import { ensureDefaultRolesAvailable } from "@/core/policy/ensureDefaultRoles";
import { mapClaimRoleToPolicyRole } from "@/core/policy/requestMapping";
import { dispatchOnboardingInvitationEmail } from "@/lib/tasks/email-worker";
import { prisma } from "@/lib/db/prismaClient";

interface OnboardTenantRequestBody {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  plan: "starter" | "growth" | "enterprise";
  ownerEmail: string;
  ownerDepartment?: string;
  // Richer "Create New Tenant" form fields (app/admin/tenants/create) -- all
  // optional so the original 3-step wizard (app/admin/onboard) keeps working
  // unchanged. organizationType/industry/description/billing/region/timezone
  // have no dedicated columns, so they're folded into Tenant.settings (Json).
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
const BCRYPT_SALT_ROUNDS = 10;

/** Pending-acceptance sentinel, deliberately not a real hash format -- accountLocked is what actually blocks login when no password was set upfront. */
const PENDING_INVITE_PASSWORD_HASH = "PENDING_INVITATION_ACCEPTANCE";

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
 * Tenant onboarding (System Admin/Superuser workflow):
 *   1. create the Tenant row
 *   2. assert the default role tiers exist (core/policy/ensureDefaultRoles.ts)
 *   3. create the owner User row (Admin, clearance 5)
 *   4. sign a short-lived invitation token (core/auth/invitationToken.ts)
 *   5. dispatch the invitation email via the simulated background worker
 *
 * Steps 1-4 (plus the audit log write) run inside one Prisma transaction
 * so the tenant, owner, and audit entry are created atomically -- partial
 * onboarding (e.g. a tenant with no owner) should never be possible. Step
 * 5 runs after the transaction commits, fire-and-forget, so a slow/failed
 * email never rolls back a successful onboarding.
 *
 * Two owner-provisioning modes, both still supported:
 *   - No password in the body (the original 3-step wizard): owner is
 *     created accountLocked, with a sentinel passwordHash, pending invite
 *     acceptance (they set a real password by following the invite link).
 *   - A password is provided (the richer Create Tenant form): it's hashed
 *     for real with bcrypt and the owner is created unlocked immediately --
 *     no separate accept-invite step needed for them to log in.
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

  const [existingTenant, existingOwner] = await Promise.all([
    prisma.tenant.findFirst({ where: { OR: [{ id: body.tenantId }, { subdomain: body.subdomain }] } }),
    prisma.user.findUnique({ where: { email: body.ownerEmail } }),
  ]);

  if (existingTenant) {
    const conflictField = existingTenant.id === body.tenantId ? "tenantId" : "subdomain";
    return NextResponse.json({ error: `A tenant with this ${conflictField} already exists.` }, { status: 409 });
  }

  if (existingOwner) {
    return NextResponse.json({ error: "A user account with this owner email already exists." }, { status: 409 });
  }

  const ownerPasswordHash = body.password ? await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS) : PENDING_INVITE_PASSWORD_HASH;
  const ownerAccountLocked = !body.password;

  try {
    const { tenant, owner, invitationToken } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          id: body.tenantId,
          name: body.tenantName.trim(),
          subdomain: body.subdomain,
          plan: body.plan,
          status: "active",
          createdAt: new Date(),
          settings: {
            mfa_required_roles: body.mfaRequiredForAdmins === false ? [] : ["Admin"],
            max_users: 50,
            organization_type: body.organizationType ?? null,
            industry: body.industry ?? null,
            description: body.description ?? null,
            billing_cycle: body.billingCycle ?? "monthly",
            trial_enabled: body.trialEnabled ?? false,
            trial_days: body.trialDays ?? 0,
            default_user_role: body.defaultUserRole ?? "Member",
            allow_user_registration: body.allowUserRegistration ?? false,
            data_region: body.dataRegion ?? null,
            time_zone: body.timeZone ?? null,
          },
        },
      });

      const owner = await tx.user.create({
        data: {
          id: randomUUID(),
          email: body.ownerEmail,
          passwordHash: ownerPasswordHash,
          role: "Admin",
          clearance: 5,
          department: (body.ownerDepartment ?? "General").trim(),
          mfaVerified: false,
          accountLocked: ownerAccountLocked,
          tenantId: tenant.id,
        },
      });

      const invitationToken = signInvitationToken({
        sub: owner.id,
        tenant_id: tenant.id,
        email: owner.email,
        role: "Admin",
      });

      const callerEmail = platformSession
        ? "platform-admin"
        : (await tx.user.findUnique({ where: { id: tenantClaims?.sub ?? "" }, select: { email: true } }))?.email;

      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          timestamp: new Date(),
          tenantId: tenant.id,
          subjectId: tenantClaims?.sub ?? null,
          subjectEmail: callerEmail ?? "anonymous",
          action: "WRITE",
          resource: "tenant_onboarding",
          outcome: "ALLOW",
          reason: "invitation_token_issued",
          ipAddress: request.headers.get("x-forwarded-for") ?? "internal",
        },
      });

      return { tenant, owner, invitationToken };
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
        tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain, plan: tenant.plan },
        owner: { id: owner.id, email: owner.email, role: owner.role, clearance: owner.clearance, accountLocked: owner.accountLocked },
        invitationDispatched: true,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "A tenant or owner account with these identifiers already exists." },
        { status: 409 },
      );
    }

    console.error("Tenant onboarding failed", error);
    return NextResponse.json({ error: "Tenant onboarding failed unexpectedly." }, { status: 500 });
  }
}

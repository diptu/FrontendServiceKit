import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";

// Plain CommonJS require for the JSON fixture -- sidesteps ESM JSON
// import-attribute syntax entirely, so this seed script runs the same way
// regardless of Node version.
const require = createRequire(import.meta.url);
const mockData = require("../src/mock/data.json");

const prisma = new PrismaClient();

// data.json has no "documents" collection (tenants/users/auditLogs only,
// per its own spec) -- a few sample rows per tenant give the tenant-scoped
// query wrapper and its example page (Task 5) something real to query,
// with deliberately mixed clearance_required/department values.
function buildDocumentSeeds(users) {
  const usersByTenant = new Map();
  for (const user of users) {
    const list = usersByTenant.get(user.tenant_id) ?? [];
    list.push(user);
    usersByTenant.set(user.tenant_id, list);
  }

  const documents = [];
  for (const [tenantId, tenantUsers] of usersByTenant) {
    const owner = tenantUsers[0];
    documents.push(
      { title: `${tenantId} Onboarding Guide`, department: null, clearanceRequired: 1, tenantId, ownerId: owner.id },
      { title: `${tenantId} Q3 Financials`, department: "Finance", clearanceRequired: 4, tenantId, ownerId: owner.id },
      { title: `${tenantId} Security Incident Log`, department: "IT Security", clearanceRequired: 5, tenantId, ownerId: owner.id },
    );
  }
  return documents;
}

async function main() {
  for (const tenant of Object.values(mockData.tenants)) {
    await prisma.tenant.upsert({
      where: { id: tenant.tenant_id },
      create: {
        id: tenant.tenant_id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: new Date(tenant.created_at),
        settings: tenant.settings,
      },
      update: {},
    });
  }

  for (const user of mockData.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        role: user.role,
        clearance: user.clearance,
        department: user.department,
        mfaVerified: user.mfa_verified,
        accountLocked: user.account_locked,
        tenantId: user.tenant_id,
      },
      update: {},
    });
  }

  for (const document of buildDocumentSeeds(mockData.users)) {
    await prisma.document.create({ data: document });
  }

  for (const log of mockData.auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      create: {
        id: log.id,
        timestamp: new Date(log.timestamp),
        subjectEmail: log.subject_email,
        action: log.action,
        resource: log.resource,
        outcome: log.outcome,
        reason: log.reason,
        ipAddress: log.ip_address,
        tenantId: log.tenant_id,
        subjectId: log.subject_id,
      },
      update: {},
    });
  }

  console.log(
    `Seeded ${Object.keys(mockData.tenants).length} tenants, ${mockData.users.length} users, ${mockData.auditLogs.length} audit logs.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

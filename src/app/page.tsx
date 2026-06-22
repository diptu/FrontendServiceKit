import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Gauge,
  KeyRound,
  Layers,
  Lock,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

interface TenantRoleBreakdown {
  name: string;
  roles: { label: string; count: number }[];
}

// Real role counts from the seeded tenants (src/mock/data.json / prisma/seed.mjs) --
// not arbitrary placeholder numbers.
const TENANT_PREVIEWS: readonly TenantRoleBreakdown[] = [
  {
    name: "Apple Corp",
    roles: [
      { label: "Admin", count: 2 },
      { label: "Moderator", count: 1 },
      { label: "Member", count: 4 },
      { label: "User", count: 3 },
    ],
  },
  {
    name: "Orange Teck",
    roles: [
      { label: "Admin", count: 1 },
      { label: "Moderator", count: 1 },
      { label: "Member", count: 4 },
      { label: "User", count: 4 },
    ],
  },
  {
    name: "Banana Republic",
    roles: [
      { label: "Admin", count: 1 },
      { label: "Moderator", count: 1 },
      { label: "Member", count: 9 },
      { label: "User", count: 9 },
    ],
  },
];

const TRUST_BADGES: readonly { label: string; icon: typeof ShieldCheck }[] = [
  { label: "Secure by Design", icon: ShieldCheck },
  { label: "Tenant Isolation", icon: Building2 },
  { label: "MIT License", icon: KeyRound },
  { label: "RBAC + ABAC", icon: Lock },
  { label: "Scalable", icon: Gauge },
];

const FEATURES: readonly { title: string; description: string; icon: typeof Layers }[] = [
  {
    title: "Multi-Tenant Architecture",
    description: "Isolated tenant data with shared infrastructure for maximum efficiency.",
    icon: Layers,
  },
  {
    title: "Attribute-Based Access Control (ABAC)",
    description: "Fine-grained policies using attributes like role, department, clearance, time and more.",
    icon: Lock,
  },
  {
    title: "Secure Authentication & MFA",
    description: "OAuth2/OIDC, JWT tokens and optional Multi-Factor Authentication.",
    icon: ShieldCheck,
  },
  {
    title: "Complete Lifecycle Management",
    description: "User invite, onboarding, role management and deprovisioning.",
    icon: RefreshCw,
  },
];

const TECH_STACK: readonly string[] = ["Node.js", "Express.js", "MongoDB", "Redis", "JWT", "Open Policy Agent", "Docker"];

/**
 * Global, tenant-less landing page -- only ever rendered when middleware
 * sees no tenant in the Host header (bare root domain / "www"), see
 * src/middleware.ts. The hero CTA used to be a "find your workspace" slug
 * form (buildTenantOrigin -> redirect to the tenant's subdomain); that
 * flow now lives on app/sign-in (Sign In tab resolves the tenant by email
 * and redirects there, with a workspace-slug fallback if it can't), so
 * this page just routes visitors there instead of duplicating it.
 */
export default function GlobalLandingPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-green-600 text-green-600">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight text-slate-900">NutraTenant</p>
            <p className="text-xs leading-tight text-slate-500">Multi-Tenancy Microservice</p>
          </div>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A secure, scalable and flexible <span className="text-green-600">Multi-Tenant IAM &amp; ABAC</span>{" "}
              platform
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              NutraTenant provides a robust foundation for building multi-tenant applications with fine-grained
              access control. Built with modern best practices for security, isolation and scalability.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    <Icon className="h-3.5 w-3.5 text-green-600" />
                    {badge.label}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in?tab=sign-up"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">NutraTenant Core</p>
                <p className="text-[11px] text-slate-500">IAM + ABAC + Multi-Tenancy</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TENANT_PREVIEWS.map((tenant) => (
                <div key={tenant.name} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-xs font-semibold text-slate-800">{tenant.name}</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {tenant.roles.map((role) => (
                      <li key={role.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Users className="h-3 w-3 text-green-600" />
                        {role.count} {role.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 border-t border-slate-100 pt-10 text-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Tech Stack
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

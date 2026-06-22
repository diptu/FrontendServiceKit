"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Building2,
  Eye,
  EyeOff,
  Gauge,
  Github,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/core/auth/AuthContext";
import { decodeJwtClaims, getStoredAccessToken, isClaimsExpired } from "@/core/auth/authService";
import { buildTenantOrigin } from "@/core/tenant/hostname";
import { mockResolveTenantByEmail } from "@/core/tenant/mockResolveTenantByEmail";
import {
  decodePlatformAdminToken,
  getPlatformAdminSessionFromCookie,
  setPlatformAdminSessionCookie,
} from "@/core/platformAdmin/types";

type AuthTab = "sign-in" | "sign-up";

const FEATURES: readonly { title: string; description: string; icon: typeof ShieldCheck }[] = [
  {
    title: "Enterprise Ready Security",
    description: "Role & Attribute Based Access Control with MFA support.",
    icon: ShieldCheck,
  },
  {
    title: "True Tenant Isolation",
    description: "Strong isolation between tenants with secure data boundaries.",
    icon: Building2,
  },
  {
    title: "Scalable & Flexible",
    description: "Designed to scale with your business and adapt to evolving requirements.",
    icon: Gauge,
  },
  {
    title: "Complete Lifecycle Management",
    description: "From user onboarding to role management and deprovisioning.",
    icon: RefreshCw,
  },
];

function GoogleGlyph() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
      G
    </span>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 p-10 lg:flex lg:w-1/2">
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-green-600 text-green-600">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight tracking-tight text-slate-900">NutraTenant</p>
          <p className="text-xs leading-tight text-slate-500">Multi-Tenancy Microservice</p>
        </div>
      </div>

      <div className="relative">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
          Secure. Scalable.
          <br />
          Built for Multi-Tenancy.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
          NutraTenant provides a robust foundation for building multi-tenant applications with fine-grained access
          control using IAM and ABAC.
        </p>

        <ul className="mt-8 flex flex-col gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{feature.title}</p>
                  <p className="text-xs leading-relaxed text-slate-500">{feature.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div />
    </div>
  );
}

interface SignInFormState {
  tenantId: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Remembers the last workspace someone signed into on this browser, so the Tenant ID field can pre-fill itself next time. */
const TENANT_ID_STORAGE_KEY = "nutratenant_last_tenant_id";

interface LoginResponsePayload {
  access_token: string;
  refresh_token: string;
  /** Drives the post-login redirect: platform console vs. the tenant's own dashboard. */
  is_superadmin?: boolean;
}

interface ApiErrorResponsePayload {
  detail?: string;
  error?: string;
  message?: string;
}

function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponsePayload>(error)) {
    const payload = error.response?.data;
    return payload?.detail ?? payload?.error ?? payload?.message ?? "Invalid credentials or the authentication service is unreachable.";
  }

  return "Invalid credentials or the authentication service is unreachable.";
}

function SignInForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const { login } = useAuth();
  const [form, setForm] = useState<SignInFormState>({ tenantId: "", email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedTenantId = localStorage.getItem(TENANT_ID_STORAGE_KEY);
    if (storedTenantId) {
      setForm((current) => ({ ...current, tenantId: storedTenantId }));
    }

    // Already-authenticated short-circuit: jump straight to the right
    // dashboard instead of making someone who's already logged in sit
    // through this form again. Platform-admin and tenant sessions are two
    // independent cookies (core/platformAdmin/types.ts vs
    // core/auth/authService.ts) -- check both.
    const platformClaims = getPlatformAdminSessionFromCookie();
    if (platformClaims) {
      window.location.href = "/admin/dashboard";
      return;
    }

    const existingAccessToken = getStoredAccessToken();
    if (existingAccessToken) {
      const claims = decodeJwtClaims(existingAccessToken);
      if (claims && !isClaimsExpired(claims)) {
        window.location.href = buildTenantOrigin(
          claims.tenant_org,
          window.location.hostname,
          window.location.protocol,
          window.location.port,
        );
      }
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (form.email.trim().length === 0 || form.password.length === 0) {
      setError("Enter your email and password to continue.");
      return;
    }

    const typedTenantId = form.tenantId.trim().toLowerCase();
    // A typed/remembered Tenant ID wins over the email-lookup mock -- it's
    // an explicit, known-good workspace, so there's no reason to guess.
    // mockResolveTenantByEmail (core/tenant/mockResolveTenantByEmail.ts)
    // stands in for a real backend lookup when the field is left blank.
    const resolvedTenantId = typedTenantId.length > 0 ? typedTenantId : mockResolveTenantByEmail(form.email);

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<LoginResponsePayload>("/auth/login", {
        email: form.email.trim(),
        password: form.password,
        tenant_id: resolvedTenantId,
      });

      if (response.data.is_superadmin) {
        const platformClaims = decodePlatformAdminToken(response.data.access_token);
        if (platformClaims) {
          setPlatformAdminSessionCookie(response.data.access_token, platformClaims);
        }
        window.location.href = "/admin/dashboard";
        return;
      }

      const claims = await login(response.data.access_token, response.data.refresh_token);
      localStorage.setItem(TENANT_ID_STORAGE_KEY, claims.tenant_org);
      window.location.href = buildTenantOrigin(
        claims.tenant_org,
        window.location.hostname,
        window.location.protocol,
        window.location.port,
      );
    } catch (caughtError) {
      console.error("Sign-in failed", caughtError);
      setError(extractApiErrorMessage(caughtError));
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-900">Welcome back!</h2>
      <p className="mt-1 text-sm text-slate-500">Sign in to your NutraTenant account</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tenant-id" className="text-sm font-medium text-slate-700">
            Tenant ID <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              id="tenant-id"
              type="text"
              autoComplete="off"
              disabled={isSubmitting}
              value={form.tenantId}
              onChange={(event) => setForm((current) => ({ ...current, tenantId: event.target.value }))}
              placeholder="applecorp"
              className="w-full text-sm text-slate-800 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-slate-400">
            Know your workspace? Enter it here to skip the lookup. Remembered on this device for next time.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              className="w-full text-sm text-slate-800 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
            <Lock className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isSubmitting}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
              className="w-full text-sm text-slate-800 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) => setForm((current) => ({ ...current, rememberMe: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            Remember me
          </label>
          <a href="#" className="font-medium text-green-700 hover:text-green-800">
            Forgot password?
          </a>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <GoogleGlyph />
          Sign in with Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Github className="h-4 w-4" />
          Sign in with GitHub
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitchTab} className="font-medium text-green-700 hover:text-green-800">
          Sign up
        </button>
      </p>
    </>
  );
}

interface SignUpFormState {
  fullName: string;
  workEmail: string;
  password: string;
}

function SignUpForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const [form, setForm] = useState<SignUpFormState>({ fullName: "", workEmail: "", password: "" });

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
      <p className="mt-1 text-sm text-slate-500">Get started with NutraTenant</p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
        New workspaces are currently provisioned by a platform administrator, not via self-serve sign-up. If your
        organization already has a workspace, ask an admin to send you an onboarding invitation instead.
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mt-4 flex flex-col gap-4 opacity-60"
        aria-disabled="true"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            disabled
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Jane Doe"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Work Email</label>
          <input
            type="email"
            disabled
            value={form.workEmail}
            onChange={(event) => setForm((current) => ({ ...current, workEmail: event.target.value }))}
            placeholder="you@company.com"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            disabled
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="••••••••"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchTab} className="font-medium text-green-700 hover:text-green-800">
          Sign in
        </button>
      </p>
    </>
  );
}

function AuthCard() {
  const searchParams = useSearchParams();
  const initialTab: AuthTab = searchParams.get("tab") === "sign-up" ? "sign-up" : "sign-in";
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:px-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("sign-in")}
            className={`rounded-md py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "sign-in" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sign-up")}
            className={`rounded-md py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "sign-up" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "sign-in" ? (
            <SignInForm onSwitchTab={() => setActiveTab("sign-up")} />
          ) : (
            <SignUpForm onSwitchTab={() => setActiveTab("sign-in")} />
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Secure authentication
          </span>
          <span>Your data is always protected</span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <BrandPanel />
      <Suspense fallback={<div className="flex w-full items-center justify-center lg:w-1/2" />}>
        <AuthCard />
      </Suspense>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/core/auth/AuthContext";
import { resolveTenantHostname } from "@/core/tenant/hostname";
import { getTenantBranding } from "@/core/tenant/branding";

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  formError?: string;
}

interface LoginResponsePayload {
  access_token: string;
  refresh_token: string;
}

/** Common FastAPI-style error response shapes -- whichever field is present, smoothly surfaced instead of a generic message. */
interface ApiErrorResponsePayload {
  detail?: string;
  error?: string;
  message?: string;
}

interface SsoProvider {
  id: "google" | "microsoft" | "github";
  label: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const SSO_PROVIDERS: readonly SsoProvider[] = [
  { id: "google", label: "Google" },
  { id: "microsoft", label: "Microsoft" },
  { id: "github", label: "GitHub" },
];

function validateLoginForm(state: LoginFormState): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (state.email.trim().length === 0) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(state.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (state.password.length === 0) {
    errors.password = "Password is required.";
  } else if (state.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponsePayload>(error)) {
    const payload = error.response?.data;
    return payload?.detail ?? payload?.error ?? payload?.message ?? "Invalid credentials or the authentication service is unreachable.";
  }

  return "Invalid credentials or the authentication service is unreachable.";
}

/**
 * Tenant slug isn't available as a route param here -- this page is
 * app/(auth)/login (no [tenant] segment), reached directly on the
 * tenant's own subdomain (middleware.ts treats /login as a public
 * passthrough path, see PUBLIC_PATHS). Computed client-side post-mount
 * from window.location, same reasoning as buildTenantOrigin()'s callers
 * elsewhere in this app: avoids an SSR/hydration mismatch, since the
 * server has no Host-derived tenant context to hand this page.
 */
function useTenantSlug(): string | null {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);

  useEffect(() => {
    const hostnameResult = resolveTenantHostname(window.location.host);
    setTenantSlug(hostnameResult.kind === "none" ? null : hostnameResult.identifier);
  }, []);

  return tenantSlug;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const tenantSlug = useTenantSlug();
  const branding = getTenantBranding(tenantSlug);

  const [formState, setFormState] = useState<LoginFormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function updateField<K extends keyof LoginFormState>(field: K, value: LoginFormState[K]): void {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationErrors = validateLoginForm(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<LoginResponsePayload>("/auth/login", {
        email: formState.email.trim(),
        password: formState.password,
        // TODO: remove tenant_id once the backend identifies the tenant from
        // the authenticated session/JWT alone -- sent for now since the live
        // multi-tenant gateway needs an explicit tenant context per request.
        tenant_id: tenantSlug,
      });

      await login(response.data.access_token, response.data.refresh_token);
      router.push("/");
    } catch (error) {
      console.error("Login request failed", error);
      setErrors({ formError: extractApiErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  function ssoHref(provider: SsoProvider["id"]): string {
    const url = new URL(`/auth/sso/${provider}`, API_BASE_URL);
    if (tenantSlug) {
      url.searchParams.set("tenant", tenantSlug);
    }
    return url.toString();
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
      <div className="mb-6 flex items-center gap-2">
        <Image
          src="/logo.jpeg"
          alt={`${branding.displayName} logo`}
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <span className="text-lg font-semibold tracking-tight text-zinc-800">{branding.displayName}</span>
      </div>

      <h1 className="text-xl font-semibold text-zinc-800">Sign in to your workspace</h1>
      <p className="mt-1 text-sm text-zinc-500">Enter your credentials to access the tenant control plane.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={formState.email}
            disabled={isSubmitting}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="admin@nutratenant.io"
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60 ${
              errors.email ? "border-red-400" : "border-zinc-200"
            }`}
          />
          {errors.email && <span className="text-xs font-medium text-red-600">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={formState.password}
            disabled={isSubmitting}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="••••••••"
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60 ${
              errors.password ? "border-red-400" : "border-zinc-200"
            }`}
          />
          {errors.password && <span className="text-xs font-medium text-red-600">{errors.password}</span>}
        </div>

        {errors.formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
            {errors.formError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {isSubmitting ? "Signing in..." : "Continue"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Or continue with</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SSO_PROVIDERS.map((provider) => (
          <a
            key={provider.id}
            href={ssoHref(provider.id)}
            aria-disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 ${
              isSubmitting ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {provider.label}
          </a>
        ))}
      </div>
    </div>
  );
}

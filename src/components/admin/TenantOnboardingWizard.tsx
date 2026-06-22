"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Rocket,
} from "lucide-react";

type Plan = "starter" | "growth" | "enterprise";

interface OnboardingFormState {
  tenantName: string;
  tenantId: string;
  subdomain: string;
  plan: Plan;
  ownerEmail: string;
  ownerDepartment: string;
}

interface OnboardSuccessResponse {
  tenant: { id: string; name: string; subdomain: string; plan: string };
  owner: { id: string; email: string; role: string; clearance: number };
  invitationDispatched: boolean;
}

interface OnboardErrorResponse {
  error: string;
  details?: string[];
}

const INITIAL_STATE: OnboardingFormState = {
  tenantName: "",
  tenantId: "",
  subdomain: "",
  plan: "starter",
  ownerEmail: "",
  ownerDepartment: "",
};

const STEPS = ["Corporate Info", "Owner Identity", "Confirm & Deploy"] as const;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function subdomainify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : isComplete
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-slate-400"
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
            </div>
            {stepNumber < STEPS.length && <div className="h-px w-8 bg-gray-200" />}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Tenant Onboarding wizard (System Admin/Superuser tool). Posts to
 * app/api/admin/onboard-tenant/route.ts, which performs the full atomic
 * sequence server-side -- this component is presentation + client-side
 * step validation only.
 */
export default function TenantOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingFormState>(INITIAL_STATE);
  const [tenantIdTouched, setTenantIdTouched] = useState(false);
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardSuccessResponse | null>(null);

  function updateTenantName(value: string) {
    setForm((current) => ({
      ...current,
      tenantName: value,
      tenantId: tenantIdTouched ? current.tenantId : slugify(value),
      subdomain: subdomainTouched ? current.subdomain : subdomainify(value),
    }));
  }

  const step1Valid = useMemo(
    () => form.tenantName.trim().length >= 2 && form.tenantId.length >= 3 && form.subdomain.length >= 3,
    [form.tenantName, form.tenantId, form.subdomain],
  );

  const step2Valid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail) && form.ownerDepartment.trim().length > 0,
    [form.ownerEmail, form.ownerDepartment],
  );

  async function handleDeploy() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/onboard-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const errorPayload = payload as OnboardErrorResponse;
        const message = errorPayload.details?.length ? errorPayload.details.join(" ") : errorPayload.error;
        throw new Error(message ?? "Tenant onboarding failed.");
      }

      setResult(payload as OnboardSuccessResponse);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Tenant onboarding failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_STATE);
    setTenantIdTouched(false);
    setSubdomainTouched(false);
    setStep(1);
    setResult(null);
    setSubmitError(null);
  }

  if (result) {
    return (
      <div className="w-full max-w-lg rounded-xl border border-green-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-800">{result.tenant.name} is deployed</h2>
        <p className="mt-2 text-sm text-slate-500">
          Owner account created for <span className="font-medium text-slate-700">{result.owner.email}</span> as{" "}
          {result.owner.role} (clearance {result.owner.clearance}). An onboarding invitation has been dispatched.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Onboard another tenant
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Rocket className="h-5 w-5 text-indigo-600" />
        <h1 className="text-lg font-semibold text-slate-800">Tenant Onboarding</h1>
      </div>

      <StepIndicator currentStep={step} />

      <div className="mt-6 flex flex-col gap-4">
        {step === 1 && (
          <>
            <label className="text-sm text-slate-600">
              Corporate name
              <input
                type="text"
                value={form.tenantName}
                onChange={(event) => updateTenantName(event.target.value)}
                placeholder="Globex Corporation"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Tenant slug (internal ID)
              <input
                type="text"
                value={form.tenantId}
                onChange={(event) => {
                  setTenantIdTouched(true);
                  setForm((current) => ({ ...current, tenantId: slugify(event.target.value) }));
                }}
                placeholder="globex_corp"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Subdomain
              <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="text"
                  value={form.subdomain}
                  onChange={(event) => {
                    setSubdomainTouched(true);
                    setForm((current) => ({ ...current, subdomain: subdomainify(event.target.value) }));
                  }}
                  placeholder="globexcorp"
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                />
                <span className="shrink-0 bg-gray-50 px-3 py-2 text-sm text-slate-400">.nutratenant.com</span>
              </div>
            </label>

            <label className="text-sm text-slate-600">
              Plan
              <select
                value={form.plan}
                onChange={(event) => setForm((current) => ({ ...current, plan: event.target.value as Plan }))}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>

            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="text-sm text-slate-600">
              Owner email
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(event) => setForm((current) => ({ ...current, ownerEmail: event.target.value }))}
                placeholder="owner@company.com"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              Owner department
              <input
                type="text"
                value={form.ownerDepartment}
                onChange={(event) => setForm((current) => ({ ...current, ownerDepartment: event.target.value }))}
                placeholder="Executive Operations"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <p className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
              This identity will be created as an <span className="font-semibold">Admin</span> with clearance{" "}
              <span className="font-semibold">5</span>, locked until they accept the onboarding invitation.
            </p>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span className="font-medium">{form.tenantName}</span>
                <span className="text-slate-400">({form.tenantId})</span>
              </div>
              <div className="text-slate-500">{form.subdomain}.nutratenant.com &middot; {form.plan} plan</div>
              <div className="mt-1 flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-indigo-600" />
                <span>{form.ownerEmail}</span>
                <span className="text-slate-400">({form.ownerDepartment})</span>
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {isSubmitting ? "Deploying..." : "Deploy Tenant"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

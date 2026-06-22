"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Lock,
  Mail,
  Plus,
  Settings2,
  ShieldCheck,
  User,
} from "lucide-react";
import SendInvitationModal, { type InvitationEmailDetails } from "./SendInvitationModal";

type Plan = "starter" | "growth" | "enterprise";
type BillingCycle = "monthly" | "annually";
type DefaultRole = "Admin" | "Moderator" | "Member" | "User";

interface CreateTenantFormState {
  tenantName: string;
  tenantSlug: string;
  organizationType: string;
  industry: string;
  description: string;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
  confirmPassword: string;
  plan: Plan;
  billingCycle: BillingCycle;
  trialEnabled: boolean;
  trialDays: number;
  defaultUserRole: DefaultRole;
  mfaRequiredForAdmins: boolean;
  allowUserRegistration: boolean;
  dataRegion: string;
  timeZone: string;
  confirmedAuthority: boolean;
}

const INITIAL_STATE: CreateTenantFormState = {
  tenantName: "",
  tenantSlug: "",
  organizationType: "",
  industry: "",
  description: "",
  ownerFullName: "",
  ownerEmail: "",
  password: "",
  confirmPassword: "",
  plan: "starter",
  billingCycle: "monthly",
  trialEnabled: true,
  trialDays: 7,
  defaultUserRole: "Member",
  mfaRequiredForAdmins: true,
  allowUserRegistration: true,
  dataRegion: "us-east",
  timeZone: "utc",
  confirmedAuthority: false,
};

const PLAN_OPTIONS: ReadonlyArray<{ id: Plan; label: string; description: string }> = [
  { id: "starter", label: "Starter Plan", description: "Small teams getting started" },
  { id: "growth", label: "Growth Plan", description: "Growing organizations" },
  { id: "enterprise", label: "Enterprise Plan", description: "Full platform capabilities" },
];

const ORGANIZATION_TYPES = ["Corporation", "LLC", "Nonprofit", "Government", "Startup", "Other"];
const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Retail", "Education", "Manufacturing", "Other"];
const DATA_REGIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "us-east", label: "US East (N. Virginia)" },
  { id: "us-west", label: "US West (Oregon)" },
  { id: "eu-west", label: "EU West (Ireland)" },
];
const TIME_ZONES: ReadonlyArray<{ id: string; label: string }> = [
  { id: "utc", label: "(UTC) Coordinated Universal Time" },
  { id: "est", label: "(UTC-05:00) Eastern Time" },
  { id: "pst", label: "(UTC-08:00) Pacific Time" },
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface OnboardErrorResponse {
  error: string;
  details?: string[];
}

interface FormSectionProps {
  title: string;
  icon: typeof Building2;
  children: ReactNode;
}

function FormSection({ title, icon: Icon, children }: FormSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-green-600" />
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-green-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

const inputClassName =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export default function CreateTenantForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTenantFormState>(INITIAL_STATE);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ tenantName: string; subdomain: string } | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  function update<K extends keyof CreateTenantFormState>(key: K, value: CreateTenantFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTenantName(value: string) {
    setForm((current) => ({
      ...current,
      tenantName: value,
      tenantSlug: slugTouched ? current.tenantSlug : slugify(value),
    }));
  }

  const isFormValid = useMemo(() => {
    return (
      form.tenantName.trim().length >= 2 &&
      form.tenantName.trim().length <= 100 &&
      form.tenantSlug.length >= 2 &&
      form.tenantSlug.length <= 100 &&
      form.ownerFullName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail) &&
      form.password.length >= 8 &&
      form.password === form.confirmPassword &&
      form.confirmedAuthority
    );
  }, [form]);

  function handleCreateTenantClick() {
    if (!isFormValid) {
      setSubmitError("Fill in all required fields, confirm the password matches, and check the authorization box.");
      return;
    }

    setSubmitError(null);
    setIsInviteModalOpen(true);
  }

  async function handleConfirmInvitation(invitation: InvitationEmailDetails) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/onboard-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: form.tenantSlug.replace(/-/g, "_"),
          tenantName: form.tenantName,
          subdomain: form.tenantSlug,
          plan: form.plan,
          ownerEmail: form.ownerEmail,
          ownerFullName: form.ownerFullName,
          password: form.password,
          confirmPassword: form.confirmPassword,
          organizationType: form.organizationType || undefined,
          industry: form.industry || undefined,
          description: form.description || undefined,
          billingCycle: form.billingCycle,
          trialEnabled: form.trialEnabled,
          trialDays: form.trialDays,
          defaultUserRole: form.defaultUserRole,
          mfaRequiredForAdmins: form.mfaRequiredForAdmins,
          allowUserRegistration: form.allowUserRegistration,
          dataRegion: form.dataRegion,
          timeZone: form.timeZone,
          invitationFromName: invitation.fromName,
          invitationSubject: invitation.subject,
          invitationMessage: invitation.message,
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const errorPayload = payload as OnboardErrorResponse;
        throw new Error(errorPayload.details?.join(" ") ?? errorPayload.error ?? "Tenant creation failed.");
      }

      setIsInviteModalOpen(false);
      setSuccess({ tenantName: form.tenantName, subdomain: form.tenantSlug });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Tenant creation failed.");
      setIsInviteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
        <h2 className="text-lg font-semibold text-slate-900">{success.tenantName} created</h2>
        <p className="text-sm text-slate-500">
          Workspace available at <span className="font-mono">{success.subdomain}.nutratenant.com</span>. An
          onboarding invitation has been dispatched to the admin user.
        </p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_STATE);
              setSlugTouched(false);
              setSuccess(null);
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Create another
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleCreateTenantClick();
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <FormSection title="Tenant Information" icon={Building2}>
            <Field label="Tenant Name">
              <input
                type="text"
                value={form.tenantName}
                onChange={(event) => updateTenantName(event.target.value)}
                placeholder="Acme Corp"
                minLength={2}
                maxLength={100}
                className={inputClassName}
              />
            </Field>
            <Field label="Tenant Slug" hint={`Used for subdomain access (e.g., ${form.tenantSlug || "acme-corp"}.nutratenant.com)`}>
              <input
                type="text"
                value={form.tenantSlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  update("tenantSlug", slugify(event.target.value));
                }}
                minLength={2}
                maxLength={100}
                placeholder="acme-corp"
                className={`${inputClassName} font-mono`}
              />
            </Field>
            <Field label="Organization Type">
              <select
                value={form.organizationType}
                onChange={(event) => update("organizationType", event.target.value)}
                className={inputClassName}
              >
                <option value="">Select organization type</option>
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Industry">
              <select value={form.industry} onChange={(event) => update("industry", event.target.value)} className={inputClassName}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Brief description of the tenant organization..."
                rows={3}
                className={inputClassName}
              />
            </Field>
          </FormSection>

          <FormSection title="Admin User" icon={User}>
            <Field label="Full Name">
              <input
                type="text"
                value={form.ownerFullName}
                onChange={(event) => update("ownerFullName", event.target.value)}
                placeholder="John Smith"
                className={inputClassName}
              />
            </Field>
            <Field label="Email Address">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(event) => update("ownerEmail", event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="Enter strong password"
                  className="w-full text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </Field>
            <Field label="Confirm Password">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => update("confirmPassword", event.target.value)}
                  placeholder="Confirm password"
                  className="w-full text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </Field>
          </FormSection>
        </div>

        <div className="flex flex-col gap-6">
          <FormSection title="Plan & Subscription" icon={ShieldCheck}>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Subscription Plan</span>
              {PLAN_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => update("plan", option.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    form.plan === option.id ? "border-green-500 bg-green-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    <span className="font-medium text-slate-800">{option.label}</span>
                    <span className="ml-2 text-xs text-slate-500">{option.description}</span>
                  </span>
                  {form.plan === option.id && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Billing Cycle</span>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => update("billingCycle", "monthly")}
                  className={`rounded-md py-1.5 text-sm font-medium ${form.billingCycle === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => update("billingCycle", "annually")}
                  className={`rounded-md py-1.5 text-sm font-medium ${form.billingCycle === "annually" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Annually <span className="text-green-600">(Save 20%)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Field label="Trial Period">
                <input
                  type="number"
                  min={0}
                  value={form.trialDays}
                  onChange={(event) => update("trialDays", Number(event.target.value))}
                  className={`${inputClassName} w-24`}
                />
              </Field>
              <div className="pt-6">
                <ToggleSwitch checked={form.trialEnabled} onChange={(value) => update("trialEnabled", value)} label="Enable Trial" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Settings & Configuration" icon={Settings2}>
            <Field label="Default User Role">
              <select
                value={form.defaultUserRole}
                onChange={(event) => update("defaultUserRole", event.target.value as DefaultRole)}
                className={inputClassName}
              >
                {(["Admin", "Moderator", "Member", "User"] as DefaultRole[]).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
            <ToggleSwitch
              checked={form.mfaRequiredForAdmins}
              onChange={(value) => update("mfaRequiredForAdmins", value)}
              label="MFA Required for Admins"
            />
            <ToggleSwitch
              checked={form.allowUserRegistration}
              onChange={(value) => update("allowUserRegistration", value)}
              label="Allow User Registration"
            />
            <Field label="Data Region">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
                <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                <select
                  value={form.dataRegion}
                  onChange={(event) => update("dataRegion", event.target.value)}
                  className="w-full text-sm text-slate-800 focus:outline-none"
                >
                  {DATA_REGIONS.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Time Zone">
              <select value={form.timeZone} onChange={(event) => update("timeZone", event.target.value)} className={inputClassName}>
                {TIME_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </Field>
          </FormSection>
        </div>
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={form.confirmedAuthority}
            onChange={(event) => update("confirmedAuthority", event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
          />
          I confirm that I have the necessary permissions to create this tenant on behalf of the organization.
        </label>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isSubmitting ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </div>

      {isInviteModalOpen && (
        <SendInvitationModal
          toEmail={form.ownerEmail}
          tenantName={form.tenantName}
          ownerFullName={form.ownerFullName}
          isSending={isSubmitting}
          onCancel={() => setIsInviteModalOpen(false)}
          onConfirm={(invitation) => void handleConfirmInvitation(invitation)}
        />
      )}
    </form>
  );
}

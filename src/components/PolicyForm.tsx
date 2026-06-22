"use client";

import { useState, type FormEvent } from "react";
import apiClient from "@/lib/api/client";

interface PolicyFormState {
  policyName: string;
  resourcePath: string;
  allowedRoles: string;
  tokenTtlMinutes: string;
  riskThreshold: string;
  enforceMfa: boolean;
  requireRefreshRotation: boolean;
}

interface PolicyPayload {
  policy_name: string;
  resource_path: string;
  allowed_roles: string[];
  token_ttl_minutes: number;
  risk_threshold: number;
  enforce_mfa: boolean;
  require_refresh_token_rotation: boolean;
}

type PolicyFormErrors = Partial<Record<keyof PolicyFormState, string>>;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const INITIAL_STATE: PolicyFormState = {
  policyName: "",
  resourcePath: "",
  allowedRoles: "",
  tokenTtlMinutes: "60",
  riskThreshold: "0.50",
  enforceMfa: true,
  requireRefreshRotation: false,
};

function validatePolicyForm(state: PolicyFormState): PolicyFormErrors {
  const errors: PolicyFormErrors = {};

  if (state.policyName.trim().length === 0) {
    errors.policyName = "Policy name is required.";
  } else if (state.policyName.trim().length < 3) {
    errors.policyName = "Policy name must be at least 3 characters.";
  }

  if (state.resourcePath.trim().length === 0) {
    errors.resourcePath = "Resource path is required.";
  } else if (!state.resourcePath.startsWith("/")) {
    errors.resourcePath = "Resource path must start with a leading slash, e.g. /api/v1/users.";
  }

  if (state.allowedRoles.trim().length === 0) {
    errors.allowedRoles = "Provide at least one role, separated by commas.";
  }

  const ttlValue = Number(state.tokenTtlMinutes);
  if (Number.isNaN(ttlValue)) {
    errors.tokenTtlMinutes = "Token TTL must be a number.";
  } else if (ttlValue < 5 || ttlValue > 1440) {
    errors.tokenTtlMinutes = "Token TTL must be between 5 and 1440 minutes.";
  }

  const riskValue = Number(state.riskThreshold);
  if (Number.isNaN(riskValue)) {
    errors.riskThreshold = "Risk threshold must be a number.";
  } else if (riskValue < 0 || riskValue > 1) {
    errors.riskThreshold = "Risk threshold must be between 0.0 and 1.0.";
  }

  return errors;
}

export default function PolicyForm() {
  const [formState, setFormState] = useState<PolicyFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<PolicyFormErrors>({});
  const [lastPayload, setLastPayload] = useState<PolicyPayload | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  function updateField<K extends keyof PolicyFormState>(field: K, value: PolicyFormState[K]): void {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationErrors = validatePolicyForm(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitStatus("idle");
      return;
    }

    const payload: PolicyPayload = {
      policy_name: formState.policyName.trim(),
      resource_path: formState.resourcePath.trim(),
      allowed_roles: formState.allowedRoles
        .split(",")
        .map((role) => role.trim())
        .filter((role) => role.length > 0),
      token_ttl_minutes: Number(formState.tokenTtlMinutes),
      risk_threshold: Number(formState.riskThreshold),
      enforce_mfa: formState.enforceMfa,
      require_refresh_token_rotation: formState.requireRefreshRotation,
    };

    console.log(JSON.stringify(payload, null, 2));
    setLastPayload(payload);
    setSubmitStatus("submitting");

    try {
      await apiClient.post("/iam/policies", payload);
      setSubmitStatus("success");
    } catch (error) {
      console.error("Policy submission failed", error);
      setSubmitStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-800">ABAC Policy Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define the access conditions and token behavior enforced for a given resource path.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="policyName" className="text-sm font-medium text-slate-700">
            Policy Name
          </label>
          <input
            id="policyName"
            type="text"
            value={formState.policyName}
            onChange={(event) => updateField("policyName", event.target.value)}
            placeholder="e.g. Finance Service Access Policy"
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.policyName ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.policyName && (
            <span className="text-xs font-medium text-red-600">{errors.policyName}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="resourcePath" className="text-sm font-medium text-slate-700">
            Resource Path
          </label>
          <input
            id="resourcePath"
            type="text"
            value={formState.resourcePath}
            onChange={(event) => updateField("resourcePath", event.target.value)}
            placeholder="/api/v1/finance/reports"
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.resourcePath ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.resourcePath && (
            <span className="text-xs font-medium text-red-600">{errors.resourcePath}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label htmlFor="allowedRoles" className="text-sm font-medium text-slate-700">
            Allowed Roles
          </label>
          <input
            id="allowedRoles"
            type="text"
            value={formState.allowedRoles}
            onChange={(event) => updateField("allowedRoles", event.target.value)}
            placeholder="org_admin, policy_editor, audit_viewer"
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.allowedRoles ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.allowedRoles ? (
            <span className="text-xs font-medium text-red-600">{errors.allowedRoles}</span>
          ) : (
            <span className="text-xs text-slate-400">Separate multiple role identifiers with commas.</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tokenTtlMinutes" className="text-sm font-medium text-slate-700">
            Token TTL (minutes)
          </label>
          <input
            id="tokenTtlMinutes"
            type="number"
            min={5}
            max={1440}
            value={formState.tokenTtlMinutes}
            onChange={(event) => updateField("tokenTtlMinutes", event.target.value)}
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.tokenTtlMinutes ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.tokenTtlMinutes && (
            <span className="text-xs font-medium text-red-600">{errors.tokenTtlMinutes}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="riskThreshold" className="text-sm font-medium text-slate-700">
            Risk Threshold (0.0 - 1.0)
          </label>
          <input
            id="riskThreshold"
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={formState.riskThreshold}
            onChange={(event) => updateField("riskThreshold", event.target.value)}
            className={`rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.riskThreshold ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.riskThreshold && (
            <span className="text-xs font-medium text-red-600">{errors.riskThreshold}</span>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3.5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Enforce MFA</span>
            <span className="text-xs text-slate-400">
              Require a second authentication factor on every session.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formState.enforceMfa}
            onClick={() => updateField("enforceMfa", !formState.enforceMfa)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              formState.enforceMfa ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                formState.enforceMfa ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3.5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Require Refresh Token Rotation</span>
            <span className="text-xs text-slate-400">
              Issue a new refresh token on every exchange request.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formState.requireRefreshRotation}
            onClick={() => updateField("requireRefreshRotation", !formState.requireRefreshRotation)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              formState.requireRefreshRotation ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                formState.requireRefreshRotation ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3 lg:col-span-2">
          <button
            type="submit"
            disabled={submitStatus === "submitting"}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitStatus === "submitting" ? "Submitting Policy..." : "Save Policy"}
          </button>

          {submitStatus === "success" && (
            <span className="text-sm font-medium text-green-700">
              Policy submitted to the IAM gateway.
            </span>
          )}
          {submitStatus === "error" && (
            <span className="text-sm font-medium text-red-600">
              Gateway unreachable — payload captured locally below.
            </span>
          )}
        </div>
      </form>

      {lastPayload && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last Submitted Payload
          </p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs text-slate-100">
            {JSON.stringify(lastPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

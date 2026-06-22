"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/AuthContext";
import { getStoredAccessToken } from "@/core/auth/authService";
import { getTenantBranding } from "@/core/tenant/branding";

const MFA_CODE_LENGTH = 6;

interface MfaVerificationResponsePayload {
  access_token: string;
  refresh_token: string;
}

interface MfaVerificationErrorPayload {
  error?: string;
}

function emptyDigits(): string[] {
  return Array(MFA_CODE_LENGTH).fill("");
}

/**
 * Phase 3 ABAC: standalone 6-digit TOTP challenge UI, factored out of
 * app/(auth)/mfa/page.tsx so it can be reused outside that route. Posts to
 * the Next.js Route Handler at /api/auth/mfa/verify (not directly to the
 * FastAPI gateway via lib/api/client.ts) since that handler needs to run
 * same-origin and forwards tenant_id explicitly -- middleware skips /api,
 * so there's no x-tenant-id header to read on that path.
 */
export default function TotpVerificationForm() {
  const router = useRouter();
  const { login, tenantContext, logout } = useAuth();
  const branding = getTenantBranding(tenantContext);

  const [digits, setDigits] = useState<string[]>(emptyDigits());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, event: ChangeEvent<HTMLInputElement>): void {
    const sanitizedValue = event.target.value.replace(/[^0-9]/g, "").slice(-1);

    setDigits((current) => {
      const next = [...current];
      next[index] = sanitizedValue;
      return next;
    });

    if (sanitizedValue.length > 0 && index < MFA_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Backspace" && digits[index].length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    const pastedValue = event.clipboardData.getData("text").replace(/[^0-9]/g, "");

    if (pastedValue.length === 0) {
      return;
    }

    event.preventDefault();

    const nextDigits = emptyDigits();
    const filledCount = Math.min(pastedValue.length, MFA_CODE_LENGTH);

    for (let i = 0; i < filledCount; i += 1) {
      nextDigits[i] = pastedValue[i];
    }

    setDigits(nextDigits);
    inputRefs.current[Math.min(filledCount, MFA_CODE_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const verificationCode = digits.join("");

    if (verificationCode.length !== MFA_CODE_LENGTH) {
      setFormError(`Enter the complete ${MFA_CODE_LENGTH}-digit verification code.`);
      return;
    }

    const accessToken = getStoredAccessToken();

    if (!accessToken || tenantContext === null) {
      setFormError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tenant_id: tenantContext, code: verificationCode }),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const errorMessage = (payload as MfaVerificationErrorPayload | null)?.error;
        throw new Error(errorMessage ?? "That verification code is invalid or has expired.");
      }

      const { access_token, refresh_token } = payload as MfaVerificationResponsePayload;
      await login(access_token, refresh_token);
      router.push("/");
    } catch (error) {
      console.error("MFA verification failed", error);
      setFormError(error instanceof Error ? error.message : "That verification code is invalid or has expired.");
      setDigits(emptyDigits());
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-md">
      <div className="mb-6 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white ${branding.accentClassName}`}
        >
          {branding.logoInitials}
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-800">{branding.displayName}</span>
      </div>

      <h1 className="text-xl font-semibold text-slate-800">Verify your identity</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter the {MFA_CODE_LENGTH}-digit code from your authenticator app to continue as an administrator.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={isSubmitting}
              onChange={(event) => handleDigitChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              className="h-14 w-12 rounded-lg border border-gray-200 text-center text-xl font-semibold text-slate-800 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
            />
          ))}
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
          >
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          Cancel and sign out
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Mail, Send, X } from "lucide-react";

export interface InvitationEmailDetails {
  fromName: string;
  subject: string;
  message: string;
}

interface SendInvitationModalProps {
  toEmail: string;
  tenantName: string;
  ownerFullName: string;
  isSending: boolean;
  onCancel: () => void;
  onConfirm: (details: InvitationEmailDetails) => void;
}

function buildDefaultSubject(tenantName: string): string {
  return `You're invited to join ${tenantName} on NutraTenant`;
}

function buildDefaultMessage(ownerFullName: string, tenantName: string): string {
  return `Hello ${ownerFullName || "there"},

You have been invited as the Tenant Owner of ${tenantName} on NutraTenant.

Please click the link below to accept the invitation and set up your account.

Thank you,
The NutraTenant Team`;
}

/**
 * Confirmation/customization step between filling out the Create Tenant
 * form and actually creating it -- lets the Super Admin review and edit
 * the invitation email before app/api/admin/onboard-tenant/route.ts runs.
 * fromName/subject/message flow through to lib/tasks/email-worker.ts's
 * simulated SMTP log; there's no real email service behind this yet.
 */
export default function SendInvitationModal({
  toEmail,
  tenantName,
  ownerFullName,
  isSending,
  onCancel,
  onConfirm,
}: SendInvitationModalProps) {
  const [fromName, setFromName] = useState("NutraTenant System");
  const [subject, setSubject] = useState(buildDefaultSubject(tenantName));
  const [message, setMessage] = useState(buildDefaultMessage(ownerFullName, tenantName));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Mail className="h-4 w-4 text-green-600" />
            Send Invitation to Tenant Owner
          </h2>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Send an email invitation to the tenant owner to set up their account.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">To Email Address</span>
            <input
              type="email"
              value={toEmail}
              disabled
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">From Name</span>
            <input
              type="text"
              value={fromName}
              onChange={(event) => setFromName(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Email Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Personalized Message (Optional)</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </label>

          <p className="text-xs text-slate-400">
            The invitation will contain a secure link to accept the invitation and set a password.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSending}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ fromName, subject, message })}
            disabled={isSending}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

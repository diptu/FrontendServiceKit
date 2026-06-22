export interface OnboardingInvitationEmailJob {
  recipientEmail: string;
  tenantName: string;
  invitationToken: string;
  /** Customizable via app/admin/tenants/create's SendInvitationModal; all optional so the older onboarding wizard (no modal) keeps working with defaults. */
  fromName?: string;
  subject?: string;
  message?: string;
}

const SIMULATED_QUEUE_LATENCY_MS = 1200;
const DEFAULT_FROM_NAME = "NutraTenant System";

function defaultSubject(tenantName: string): string {
  return `You're invited to join ${tenantName} on NutraTenant`;
}

/**
 * Stand-in for a real background job (a BullMQ worker, an Upstash QStash
 * delivery, etc.) -- no queue infrastructure exists in this repo yet, so
 * this is a non-blocking setTimeout rather than an actual job enqueue.
 * Callers should fire this after their response is ready to send, not
 * await it -- the point is that email delivery never blocks the request
 * that triggered it.
 */
export function dispatchOnboardingInvitationEmail(job: OnboardingInvitationEmailJob): void {
  setTimeout(() => {
    const truncatedToken = `${job.invitationToken.slice(0, 12)}...`;
    const fromName = job.fromName ?? DEFAULT_FROM_NAME;
    const subject = job.subject ?? defaultSubject(job.tenantName);

    console.log(
      `[SMTP WORKER] Dispatched Invitation Link to ${job.recipientEmail}. From: "${fromName}". Subject: "${subject}". Token string: ${truncatedToken}`,
    );

    if (job.message) {
      console.log(`[SMTP WORKER] Message body:\n${job.message}`);
    }
  }, SIMULATED_QUEUE_LATENCY_MS);
}

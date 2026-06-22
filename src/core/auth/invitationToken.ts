import { createHmac, randomBytes } from "node:crypto";

export interface InvitationTokenPayload {
  sub: string;
  tenant_id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

const DEFAULT_TTL_SECONDS = 48 * 60 * 60; // 48h -- typical short-lived invite-link expiry

function getSigningSecret(): string {
  const secret = process.env.ONBOARDING_TOKEN_SECRET;

  if (!secret) {
    throw new Error("ONBOARDING_TOKEN_SECRET is not configured.");
  }

  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(segment: string): Buffer {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

/**
 * Real HS256 signing -- unlike the rest of this app's JWTs (see CLAUDE.md's
 * trust-boundary notes: the frontend has no signing key and never verifies
 * a signature), this one is legitimate. It only ever runs inside a Route
 * Handler, which executes purely server-side, so ONBOARDING_TOKEN_SECRET
 * never reaches the browser. Hand-rolled rather than a JWT library,
 * consistent with authService.ts's existing "no external JWT lib" choice.
 */
export function signInvitationToken(
  claims: Pick<InvitationTokenPayload, "sub" | "tenant_id" | "email" | "role">,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const payload: InvitationTokenPayload = {
    ...claims,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
    jti: randomBytes(12).toString("hex"),
  };

  const headerSegment = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadSegment = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSigningSecret()).update(`${headerSegment}.${payloadSegment}`).digest();

  return `${headerSegment}.${payloadSegment}.${base64url(signature)}`;
}

/** Verifies signature and expiry. Returns null on any failure -- malformed, tampered, or expired. */
export function verifyInvitationToken(token: string): InvitationTokenPayload | null {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const expectedSignature = base64url(
    createHmac("sha256", getSigningSecret()).update(`${headerSegment}.${payloadSegment}`).digest(),
  );

  if (expectedSignature !== signatureSegment) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadSegment).toString("utf-8")) as InvitationTokenPayload;

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

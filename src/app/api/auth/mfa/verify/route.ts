import { NextResponse, type NextRequest } from "next/server";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface VerifyMfaRequestBody {
  tenant_id: string;
  code: string;
}

function isVerifyMfaRequestBody(value: unknown): value is VerifyMfaRequestBody {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as VerifyMfaRequestBody).tenant_id === "string" &&
    typeof (value as VerifyMfaRequestBody).code === "string"
  );
}

/**
 * Route Handler proxy for TOTP verification, used instead of a direct
 * client -> FastAPI axios call (see lib/api/client.ts) because this request
 * needs to run same-origin from the browser's perspective while still
 * forwarding to the gateway server-side. The middleware's tenant rewrite
 * never reaches /api (see config.matcher in middleware.ts), so the caller
 * must pass tenant_id explicitly in the body rather than relying on
 * x-tenant-id.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isVerifyMfaRequestBody(body) || body.code.length !== 6) {
    return NextResponse.json({ error: "A tenant_id and 6-digit code are required." }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${FASTAPI_BASE_URL}/auth/verify-mfa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: JSON.stringify({ tenant_id: body.tenant_id, code: body.code }),
    });

    const payload: unknown = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "That verification code is invalid or has expired." },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("MFA verification proxy failed", error);
    return NextResponse.json({ error: "Unable to reach the authentication service." }, { status: 502 });
  }
}

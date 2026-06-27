# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: NutraTenant IAM Web

A Next.js App Router dashboard for a multi-tenant Identity & Access Management (IAM) control plane enforcing Attribute-Based Access Control (ABAC). It is a frontend client only — all identity/policy data is expected to come from an external FastAPI backend gateway, reached through a single Axios client.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — production build (also runs Next's TypeScript check)
- `npm run start` — run the production build
- `npm run lint` — `next lint` (note: Next 16 dropped the `next lint` subcommand entirely; this script currently fails with "Invalid project directory provided" regardless of working tree state — pre-existing tooling gap, not a code issue)
- `npm run typecheck` — `tsc --noEmit`

There is no test runner configured yet.

## Architecture

**Trust boundary, read this first:** every guard described below (`proxy.ts`, `RoleGuard`, `SecurityGuard`, `AllowedFor`) decides what to render based on a client-decoded JWT whose signature is never verified — this frontend has no signing key, per the FastAPI-gateway model above. That makes all of them a UX/defense-in-depth layer (route users to the right place, hide nav they can't use), not a real authorization boundary: a malicious actor can set the access-token cookie/storage to whatever claims they want. Actual tenant/role enforcement must happen server-side at the FastAPI gateway on every request; do not relax that based on any of this code existing.

**Tenant resolution is hostname-based, not path-based.** A tenant's dashboard lives on its own subdomain (`applecorp.nutratenant.com`, or `applecorp.localhost:3000` in dev) or a fully custom domain — never on a `/some-tenant/...` URL prefix. `src/proxy.ts` resolves the `Host` header to a tenant and internally rewrites to `app/[tenant]/...`; the browser URL bar never shows the tenant segment. The bare root domain (`nutratenant.com` / `www`) has no tenant and renders the global landing page instead. This superseded an earlier path-segment (`/[tenantId]/...`) design — if you find references to that elsewhere, they're stale.

- **`src/app/`** — App Router pages. Special files per Next.js 16 convention:
  - `layout.tsx` (root) — mounts `AuthProvider` and global fonts/CSS; no visual chrome (owned by per-group layouts).
  - `not-found.tsx` — root 404 page rendered by Next.js when no route matches.
  - `error.tsx` — client-side error boundary for the root layout (wraps all routes).
  - `global-error.tsx` — catches errors in the root layout itself; includes `<html>`/`<body>` since the root layout may be broken.
  - `loading.tsx` — root Suspense fallback shown while page segments stream in.
  - `(auth)/` — `login/page.tsx`, `mfa/page.tsx`. Shares `(auth)/layout.tsx` (centers a single white card on a gray canvas, no sidebar). Public, no `SecurityGuard`. Both are reached on the tenant's own subdomain (the proxy resolves the tenant and validates the registry for these paths too, it just skips the rewrite/auth checks — see proxy bullet below), so on success both just `router.push("/")` — same-origin, no tenant in the URL to construct.
  - `(system)/` — route group (URL-transparent) for standalone system/error pages that don't belong to any tenant or auth flow. Contains:
    - `403-unauthorized/page.tsx` — landing page `RoleGuard` redirects to on a failed role/MFA/tenant check. Reads `?reason=` (`role` | `mfa` | `tenant` | `unauthenticated`); "Return to My Workspace" links to `/`.
    - `tenant-not-found/page.tsx` — shown when the Host header resolves to an unknown tenant. Distinct from the global landing page (bare root domain).
    - `error/403/page.tsx` — ABAC policy denial page, reached from `proxy.ts` PEP on denied requests. Reads `?reason=`, `?resource=`, `?action=`.
    - `auth/organization-lockout/page.tsx` — shown on tenant mismatch (`proxy.ts` redirect); reads `?attempted=` / `?home=` and builds a cross-subdomain link via `buildTenantOrigin()` (client-side post-mount to avoid SSR/hydration mismatch on `window.location`).
    - `sign-in/page.tsx` — alternative sign-in entry point with brand panel.
    - `preview/page.tsx` — component library preview; always passes through `proxy.ts` without auth.
  - `[tenant]/(dashboard)/` — tenant-scoped dashboard tree: `page.tsx` (Overview), `users/page.tsx`, `policies/page.tsx`, plus `admin/`, `moderator/`, `member/` workspace-tier routes (each with its own `layout.tsx` wrapping children in `RoleGuard`). The `(dashboard)` group layout wraps children in `SecurityGuard` then `AppShell`; new tenant-scoped dashboard routes go under this segment to inherit both automatically. This whole tree is only ever reached via proxy's internal rewrite, never directly — see trust boundary note above.
  - `page.tsx` (root) — the global, tenant-less landing page (only rendered for the bare root domain / `www`, per proxy). A "find your workspace" form that navigates to `https://{slug}.${ROOT_DOMAIN}` via `buildTenantOrigin()`. No auth-state redirect logic lives here anymore — that's all in proxy now (unauthenticated tenant-subdomain visitors get redirected to `/login` server-side; authenticated visitors hitting tenant-subdomain `/` get rewritten straight to the dashboard, no client bounce).
- **`src/proxy.ts`** — Edge-runtime multi-tenant hostname routing interceptor (IAM_SERVICE.md Task 2.1). Replaces `middleware.ts` per Next.js 16 convention. Matches everything except `_next/static`, `_next/image`, `favicon.ico`, `static`, `api`. Flow: resolve `Host` via `core/tenant/hostname.ts` → if no tenant signal, pass through (global landing page) → if the path is one of the public pages (`/login`, `/mfa`, `/403-unauthorized`, `/auth/organization-lockout`, `/tenant-not-found`), pass through without rewriting → otherwise resolve the tenant against the registry (`core/tenant/registry.ts`); redirect to `/tenant-not-found` if unknown, `/login` if the access-token cookie is missing/expired, `/auth/organization-lockout` if the token's `tenant_org` doesn't match the resolved tenant, or rewrite to `/${tenant}${pathname}` with an `x-tenant-id` request header set for downstream Server Components otherwise.
- **`src/core/tenant/`**:
  - `hostname.ts` — `resolveTenantHostname(host)` parses `*.localhost` / `*.${ROOT_DOMAIN}` subdomains, the bare root domain (no tenant), and treats anything else as a custom domain (looked up by full hostname). `ROOT_DOMAIN` defaults to `nutratenant.com`, overridable via `NEXT_PUBLIC_ROOT_DOMAIN`. Also exports `buildTenantOrigin()` for constructing a tenant's absolute cross-subdomain URL from `window.location` parts.
  - `registry.ts` — `resolveTenant(identifier)` calls `GET {NEXT_PUBLIC_API_BASE_URL}/tenants/resolve?identifier=...` on the FastAPI gateway and caches the answer in an Edge-isolate-scoped `Map` (60s positive / 15s negative TTL). **This backend endpoint does not exist yet as of this writing** — confirm/add it before relying on this in any real environment.
- **`src/core/auth/`** — the auth domain:
  - `authService.ts` — pure-JS JWT decode (`decodeJwtClaims`, base64url + `TextDecoder`, no external JWT lib) and storage primitives (`processLoginResponse`, `getStoredAccessToken`, `getStoredRefreshToken`, `clearStoredTokens`, `isClaimsExpired`). Access token lives in `sessionStorage`, refresh token in `localStorage`, **and** `processLoginResponse` now also mirrors the access token into a same-name, non-`HttpOnly` cookie (cleared in `clearStoredTokens`) purely so `proxy.ts` can read it — Edge runtime has no access to `sessionStorage`. `sessionStorage` is still the source of truth for client reads; the cookie exists only for the Edge runtime and is forgeable client-side (see trust boundary note above).
  - `edgeJwt.ts` — Edge Runtime-safe JWT payload reader (`decodeJwtClaimsEdge`) used only by `proxy.ts`. Functionally the same decode as `authService.decodeJwtClaims` but without the `typeof window === "undefined"` guard, since `window` doesn't exist in the Edge runtime either — uses global `atob`/`TextDecoder` instead.
  - `AuthContext.tsx` — `AuthProvider`/`useAuth()`. On mount, restores claims from the stored access token (rejecting if missing/malformed/expired). `login()` returns the decoded `JWTClaims` (currently unused by callers post-redirect-simplification, but kept since it's useful for displaying org/user info immediately after login without waiting on a state update). `logout()` does a hard `window.location.href` redirect to `/login` (not `router.push`) so all in-memory state is genuinely flushed.
- **`src/components/auth/`**:
  - `SecurityGuard.tsx` — used only by `[tenant]/(dashboard)/layout.tsx`. Its *only* rule: if `user.role === 'ADMIN'` and `user.is_mfa_verified === false`, redirect to `/mfa` and render nothing until then. Still does not enforce "must be logged in" on its own.
  - `RoleGuard.tsx` — `<RoleGuard allowedRoles={[...]} requireMfa?>` used by the `admin/`, `moderator/`, `member/` tier layouts. Reads `tenant` via `useParams()` (works because proxy's rewrite makes Next treat the request as if it were made directly against `/[tenant]/...`) and cross-checks it against `user.tenant_org` in addition to role/MFA — normally redundant with proxy's own check, but a second layer in case this route is ever reached without going through the rewrite. Redirects to `/403-unauthorized?reason=...` on any failed check.
  - `AllowedFor.tsx` (Phase 3, Task 3.3) — declarative `roles`/`requiredScopes` visibility wrapper used in `Sidebar.tsx` to hide nav links a user can't use; same trust-boundary caveat.
- **`src/components/layout/`** — `Sidebar.tsx` (client, nav state via `usePathname`) and `AppShell.tsx` (server, composes `Sidebar` + `<main>`). Nav hrefs (`NAV_ITEMS`, `ADMIN_NAV_ITEMS`, `WORKSPACE_TIER_LINKS`) are plain same-origin paths now (`/users`, `/admin`, etc.) — no tenant prefix to build, since the hostname already is the tenant.
- **`src/components/`** (top level) — Feature components (`OverviewGrid`, `UserDirectoryTable`, `PolicyForm`, plus Phase 3's `ExpenseForm`, `MealAttendanceCard`). Each ships its own default mock dataset as a fallback prop so it renders standalone without a backend.
- **`src/lib/api/client.ts`** — The single Axios instance for the FastAPI backend. Base URL from `NEXT_PUBLIC_API_BASE_URL` (`.env.local`, gitignored). Request/response interceptors call into `core/auth/authService` (`getStoredAccessToken`/`clearStoredTokens`) rather than touching storage directly — keep it that way if either side changes.
- **`src/types/iam.ts`** — Canonical IAM type definitions (`User`, `TokenRecord`, `RolePermission`). `JWTClaims` lives in `core/auth/authService.ts` instead, since it's an auth-domain type, not a generic IAM entity.

## Conventions

- Components needing interactivity (`usePathname`, `useState`, context hooks, form handlers) are explicit `"use client"`; page/layout files stay server components unless they need a hook.
- Tailwind palette: the design intentionally maps to Tailwind's default scale — `slate-50`/`gray-100` canvas, `white` cards with `shadow-sm`/`rounded-xl`, `slate-800` text, `indigo-600` brand accent — no custom theme extension needed in `tailwind.config.ts` for this to work.
- Status/state badges follow a fixed color convention: green = active/healthy, orange = pending/degraded, gray/red = suspended/revoked/outage. Keep new status badges consistent with this rather than introducing new colors per feature.
- `IAM_SERVICE.md` in the repo root is the source-of-truth phased roadmap (Phase 1 auth/context — done; Phase 2 route guardrails — done; Phase 3 ABAC UI enforcement — in progress). Check it before assuming a feature is in/out of scope.

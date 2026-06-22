# ABAC+ Multitenet IAM SERVICE

🔐 Phase 1: Authentication, Storage, & Context State

[ ] Task 1.1: Core Auth Token Client Service

Create the authentication API client processing paths for POST /auth/login.

Implement a secure token management system using browser storage pools (localStorage/sessionStorage).

Write an automatic payload extractor to parse JWT claims (sub, tenant_org, role, is_mfa_verified).

[ ] Task 1.2: Global Reactive Auth Context Provider

Implement a centralized application state container (e.g., React Context, Redux, or Pinia store) to broadcast auth metrics.

Expose fields: user, current_balance, isAuthenticated, tenantContext.

Create global logout and storage clear routines to execute when sessions expire or validation checks fail.

[ ] Task 1.3: Administrative MFA Validation Pipeline

Build a client-side layout challenge screen for multi-factor code inputs.

Implement an interception route checking if role === 'ADMIN' and is_mfa_verified === false, redirecting them directly to the verification layout.


✅ Phase 2: Navigation & Route Guardrail Engineering

[x] Task 2.1: Multi-Tenant Route Locking Interceptor

Set up a top-level route middleware processing layer.

Write validation expressions comparing the active workspace route profile with the decrypted tenant_org claim.

Redirect users to a fallback "Organization Lockout" page if structural context mismatches are detected.

Implemented in `src/middleware.ts` (+ `src/core/auth/edgeJwt.ts`, `src/core/tenant/hostname.ts`, `src/core/tenant/registry.ts`). Superseded its own first cut: tenant identity now comes from the request hostname (subdomain or custom domain), not a `/[tenantId]/...` URL segment — the route tree is `app/[tenant]/...` and the rewrite is internal/invisible to the browser. The JWT `tenant_org` claim is still cross-checked against the hostname-resolved tenant for the lockout redirect. Caveat unchanged: the JWT is decoded, not verified (no signing key on the frontend) — this is a UX/defense-in-depth layer, not the real authorization boundary. See CLAUDE.md "trust boundary" note. Also unimplemented on the backend side: the `GET /tenants/resolve` registry endpoint `registry.ts` calls — confirm/add it before relying on this anywhere real.

[x] Task 2.2: Tiered Role Workspace Guards

Implement role verification rules within the routing architecture:

/admin/*: Grant access only if role === 'ADMIN' and is_mfa_verified === true.

/moderator/*: Grant access only if role is ADMIN or MODERATOR.

/member/*: Allow entry for any authenticated account tied to tenant H_123_4.

Configure automatic rerouting to /403-unauthorized for failed validation checks.

Implemented in `src/components/auth/RoleGuard.tsx`, wired into `src/app/[tenant]/(dashboard)/{admin,moderator,member}/layout.tsx`.

🎨 Phase 3: Dynamic UI Element & ABAC Enforcement[ ] 


[ ] Task 3.1: Time-Bound Meal Log Component LockdownModify the meal logging components to accept asset metadata parameters (creator_id, creation_timestamp, is_locked).Implement a conditional rule engine checking elapsed runtime metrics:$$\Delta t = t_{\text{current}} - t_{\text{created}}$$Force elements to enter a disabled, read-only configuration if role === 'MEMBER' and $\Delta t > 12\text{ hours}$.

[ ] Task 3.2: Deficit Spending Form EnforcementBind the component's state to the reactive current_balance global attribute.Set up an automated check inside the expense entry module to inspect financial health before rendering user input elements.Disable form submission targets if role === 'MEMBER' and current_balance < -500.00.Build an overlay warning panel component that displays the user's specific account standing and deficit messages.

[ ] Task 3.3: Action-Based Navigation Link Visibility TogglesBuild a declarative conditional view wrapper (e.g., an <AllowedFor> component) to handle element visibility.Wrap high-privilege menu links (e.g., Organization Roster, Credit Balance Adjustments) to ensure they are hidden entirely from the DOM for standard users.


---

## 📈 The Power of Daily Iteration: Score Trajectory Simulation

This simulation shows the projected score optimization path of a student utilizing PrepForge AI for just 30 minutes daily. Continuous structured micro-testing flattens the forgetting curve and accelerates quantitative pattern recognition.



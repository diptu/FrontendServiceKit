
# Navigation Inventory

All nav items across the 5 navigation shells, plus all app routes.

**Example identifiers used throughout:**
- Tenant subdomain: `applecorp` → base origin `http://applecorp.localhost:3001`
- Org slug: `nutracorp`

Dynamic segments `[tenant]` and `[orgSlug]` are injected at runtime; the browser URL never shows `[tenant]` (middleware rewrites it transparently).

---

## 1. Global Dashboard Sidebar (`src/components/layout/Sidebar.tsx`)

Rendered inside `[tenant]/(dashboard)/` for all authenticated tenant users. Role/scope visibility controlled by `AllowedFor`.

### Main Navigation

| Label | Path | Example URL |
|---|---|---|
| Overview | `/` | `http://applecorp.localhost:3001/` |
| User Access Forms | `/users` | `http://applecorp.localhost:3001/users` |
| Token Policies | `/policies` | `http://applecorp.localhost:3001/policies` |
| Plans & Features | `/plans-features` | `http://applecorp.localhost:3001/plans-features` |
| API Scopes | `/scopes` | `http://applecorp.localhost:3001/scopes` *(disabled)* |
| Audit Logs | `/audit` | `http://applecorp.localhost:3001/audit` *(disabled)* |

### Admin Operations (ADMIN role only)

| Label | Path | Example URL |
|---|---|---|
| Organization Roster | `/admin/roster` | `http://applecorp.localhost:3001/admin/roster` |
| Credit Balance Adjustments | `/admin/credit-adjustments` | `http://applecorp.localhost:3001/admin/credit-adjustments` |
| Security Audit Log | `/audit-logs` | `http://applecorp.localhost:3001/audit-logs` |

### Workspace Tier Links (role-gated entry points)

| Label | Path | Minimum role | Example URL |
|---|---|---|---|
| Admin Workspace | `/admin` | ADMIN | `http://applecorp.localhost:3001/admin` |
| Moderator Workspace | `/moderator` | MODERATOR | `http://applecorp.localhost:3001/moderator` |
| Member Workspace | `/member` | MEMBER | `http://applecorp.localhost:3001/member` |

### My Workspace (member-focused quick links)

| Label | Path | Example URL |
|---|---|---|
| Dashboard | `/member` | `http://applecorp.localhost:3001/member` |
| My Applications | `/member/applications` | `http://applecorp.localhost:3001/member/applications` |
| My Groups | `/member/groups` | `http://applecorp.localhost:3001/member/groups` |
| MFA & Security | `/member/security` | `http://applecorp.localhost:3001/member/security` |
| My Sessions | `/member/sessions` | `http://applecorp.localhost:3001/member/sessions` |
| My Profile | `/member/profile` | `http://applecorp.localhost:3001/member/profile` |
| Support | `/support` | `http://applecorp.localhost:3001/support` *(disabled)* |

---

## 2. Member Workspace Shell (`src/components/member/MemberShell.tsx`)

Dedicated shell for the `/member` tier workspace.

### Main Menu

| Label | Path | Example URL |
|---|---|---|
| Dashboard | `/member` | `http://applecorp.localhost:3001/member` |
| My Applications | `/member/applications` | `http://applecorp.localhost:3001/member/applications` |
| My Groups | `/member/groups` | `http://applecorp.localhost:3001/member/groups` |
| My Profile | `/member/profile` | `http://applecorp.localhost:3001/member/profile` |
| MFA & Security | `/member/security` | `http://applecorp.localhost:3001/member/security` |
| Sessions | `/member/sessions` | `http://applecorp.localhost:3001/member/sessions` |

### Support (disabled)

| Label | Path | Example URL |
|---|---|---|
| Audit Log | `/member/audit` | `http://applecorp.localhost:3001/member/audit` *(disabled)* |
| Support | `/member/support` | `http://applecorp.localhost:3001/member/support` *(disabled)* |

---

## 3. Organization Shell (`src/components/org/OrgShell.tsx`)

Shell for `[tenant]/org/[orgSlug]/` routes. Nav sections are built dynamically based on the viewer's org role (`owner`, `admin`, `moderator`, `member`).

Base path: `/org/nutracorp`

### Organization

| Label | Relative path | Minimum role | Example URL |
|---|---|---|---|
| Users | `/users` | member | `http://applecorp.localhost:3001/org/nutracorp/users` |
| Groups | `/groups` | member | `http://applecorp.localhost:3001/org/nutracorp/groups` |
| Applications | `/applications` | member | `http://applecorp.localhost:3001/org/nutracorp/applications` |
| Roles | `/roles` | moderator | `http://applecorp.localhost:3001/org/nutracorp/roles` |
| Permissions | `/permissions` | moderator | `http://applecorp.localhost:3001/org/nutracorp/permissions` |
| Service Accounts | `/service-accounts` | admin | `http://applecorp.localhost:3001/org/nutracorp/service-accounts` |

### Access & Security

| Label | Relative path | Minimum role | Example URL |
|---|---|---|---|
| Policies | `/policies` | moderator | `http://applecorp.localhost:3001/org/nutracorp/policies` |
| Sessions | `/sessions` | moderator | `http://applecorp.localhost:3001/org/nutracorp/sessions` |
| Access Requests | `/access-requests` | moderator | `http://applecorp.localhost:3001/org/nutracorp/access-requests` |

### Billing & Settings (owner only)

| Label | Relative path | Example URL |
|---|---|---|
| Subscriptions & Billing | `/billing` | `http://applecorp.localhost:3001/org/nutracorp/billing` |
| Organization Settings | `/settings` | `http://applecorp.localhost:3001/org/nutracorp/settings` |
| Branding | `/branding` | `http://applecorp.localhost:3001/org/nutracorp/branding` |
| Integrations | `/integrations` | `http://applecorp.localhost:3001/org/nutracorp/integrations` |

### Services

| Label | Relative path | Minimum role | Example URL |
|---|---|---|---|
| Meal Service | `/meal-service/plans` | member | `http://applecorp.localhost:3001/org/nutracorp/meal-service/plans` |

---

## 4. Meal Service Shell (`src/components/meal-service/MealServiceShell.tsx`)

Sub-app shell inside `[tenant]/org/[orgSlug]/meal-service/`. The sidebar renders a **single unified nav** (`buildFullNav`) for all roles — there is no staff/member split in the shell itself. Role-specific page content is handled inside each page (e.g. `dashboard/page.tsx` switches between `OwnerAdminDashboard` and `MemberDashboard` based on `currentUser.role`).

Base path: `/org/nutracorp/meal-service`

### Main Menu

Items are sorted A→Z as they appear in `buildFullNav`.

| Label | Relative path | Example URL |
|---|---|---|
| Analytics | `/analytics` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/analytics` |
| Cost Generation | `/cost-generation` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/cost-generation` |
| Customers | `/customers` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/customers` |
| Delivery Tracking | `/tracking` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/tracking` |
| Ingredients | `/ingredients` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/ingredients` |
| Meal Plans | `/plans` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/plans` |
| Members | `/members` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/members` |
| Menus | `/menus` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/menus` |
| My Claims | `/claims` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/claims` |
| Notifications | `/notifications` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/notifications` |
| Nutrition | `/nutrition` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/nutrition` |
| Order History | `/order-history` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/order-history` |
| Orders | `/orders` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/orders` |
| Overview | *(base)* | `http://applecorp.localhost:3001/org/nutracorp/meal-service` |
| Recipes | `/recepe` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/recepe` |
| Reports | `/reports` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/reports` |
| Reviews | `/reviews` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/reviews` |
| Today's Meals | `/today` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/today` |
| Weekly Planner | `/planner` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/planner` |

### Settings

| Label | Relative path | Example URL |
|---|---|---|
| Bills & Permissions | `/billing` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/billing` |
| System Settings | `/settings` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/settings` |

### Support

Nav links only — no pages exist yet for these routes.

| Label | Relative path | Example URL |
|---|---|---|
| Contact Support | `/support` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/support` *(no page)* |
| FAQ & Support | `/faq` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/faq` *(no page)* |

---

## 5. Platform Admin Shell (`src/components/platform-admin/PlatformAdminShell.tsx`)

Superadmin control panel. Accessible only to platform-level operators, not tenant users. Runs on the bare root domain (no tenant subdomain).

Base origin: `http://localhost:3001`

### Platform

| Label | Path | Example URL |
|---|---|---|
| Dashboard | `/admin/dashboard` | `http://localhost:3001/admin/dashboard` |

### Tenant Management

| Label | Path | Example URL |
|---|---|---|
| Tenants | `/admin/tenants` | `http://localhost:3001/admin/tenants` |
| Subscriptions | `/admin/subscriptions` | `http://localhost:3001/admin/subscriptions` |
| Plans & Features | `/admin/plans-features` | `http://localhost:3001/admin/plans-features` |
| Tenant Provisioning | `/admin/tenant-provisioning` | `http://localhost:3001/admin/tenant-provisioning` |

### IAM & SCIM

| Label | Path | Example URL |
|---|---|---|
| Users | `/admin/roster` | `http://localhost:3001/admin/roster` |
| Roles | `/admin/roles` | `http://localhost:3001/admin/roles` |
| Groups | `/admin/groups` | `http://localhost:3001/admin/groups` |
| Permissions | `/admin/permissions` | `http://localhost:3001/admin/permissions` |
| Policies (ABAC) | `/admin/policies` | `http://localhost:3001/admin/policies` |
| MFA Policies | `/admin/mfa-policies` | `http://localhost:3001/admin/mfa-policies` |
| Audit Log | `/admin/audit-logs` | `http://localhost:3001/admin/audit-logs` |
| Security Events | `/admin/security-events` | `http://localhost:3001/admin/security-events` |
| Integrations | `/admin/integrations` | `http://localhost:3001/admin/integrations` |

### System

| Label | Path | Example URL |
|---|---|---|
| Settings | `/admin/system-settings` | `http://localhost:3001/admin/system-settings` |

---

## App Routes (all `page.tsx` files)

### Public / Auth

| Route | Example URL | File |
|---|---|---|
| `/` | `http://applecorp.localhost:3001/` | `src/app/page.tsx` — global landing (bare root domain only) |
| `/login` | `http://applecorp.localhost:3001/login` | `src/app/(auth)/login/page.tsx` |
| `/mfa` | `http://applecorp.localhost:3001/mfa` | `src/app/(auth)/mfa/page.tsx` |
| `/sign-in` | `http://applecorp.localhost:3001/sign-in` | `src/app/sign-in/page.tsx` |
| `/preview` | `http://applecorp.localhost:3001/preview` | `src/app/preview/page.tsx` |
| `/403-unauthorized` | `http://applecorp.localhost:3001/403-unauthorized` | `src/app/403-unauthorized/page.tsx` |
| `/error/403` | `http://applecorp.localhost:3001/error/403` | `src/app/error/403/page.tsx` |
| `/tenant-not-found` | `http://applecorp.localhost:3001/tenant-not-found` | `src/app/tenant-not-found/page.tsx` |
| `/auth/organization-lockout` | `http://applecorp.localhost:3001/auth/organization-lockout` | `src/app/auth/organization-lockout/page.tsx` |

### Standalone Member Routes (non-tenant)

| Route | Example URL | File |
|---|---|---|
| `/member` | `http://applecorp.localhost:3001/member` | `src/app/member/page.tsx` |
| `/member/applications` | `http://applecorp.localhost:3001/member/applications` | `src/app/member/applications/page.tsx` |
| `/member/groups` | `http://applecorp.localhost:3001/member/groups` | `src/app/member/groups/page.tsx` |
| `/member/sessions` | `http://applecorp.localhost:3001/member/sessions` | `src/app/member/sessions/page.tsx` |
| `/member/security` | `http://applecorp.localhost:3001/member/security` | `src/app/member/security/page.tsx` |
| `/member/profile` | `http://applecorp.localhost:3001/member/profile` | `src/app/member/profile/page.tsx` |

### Tenant Dashboard (`[tenant]/(dashboard)/`)

Reached via middleware rewrite from the tenant subdomain. Browser URL never shows `[tenant]`.

| Route | Example URL | File |
|---|---|---|
| `/` | `http://applecorp.localhost:3001/` | `(dashboard)/page.tsx` — overview |
| `/users` | `http://applecorp.localhost:3001/users` | `(dashboard)/users/page.tsx` |
| `/policies` | `http://applecorp.localhost:3001/policies` | `(dashboard)/policies/page.tsx` |
| `/plans-features` | `http://applecorp.localhost:3001/plans-features` | `(dashboard)/plans-features/page.tsx` |
| `/audit-logs` | `http://applecorp.localhost:3001/audit-logs` | `(dashboard)/audit-logs/page.tsx` |
| `/documents` | `http://applecorp.localhost:3001/documents` | `(dashboard)/documents/page.tsx` |
| `/admin` | `http://applecorp.localhost:3001/admin` | `(dashboard)/admin/page.tsx` |
| `/admin/roster` | `http://applecorp.localhost:3001/admin/roster` | `(dashboard)/admin/roster/page.tsx` |
| `/admin/credit-adjustments` | `http://applecorp.localhost:3001/admin/credit-adjustments` | `(dashboard)/admin/credit-adjustments/page.tsx` |
| `/moderator` | `http://applecorp.localhost:3001/moderator` | `(dashboard)/moderator/page.tsx` |
| `/member` | `http://applecorp.localhost:3001/member` | `(dashboard)/member/page.tsx` |
| `/member/applications` | `http://applecorp.localhost:3001/member/applications` | `(dashboard)/member/applications/page.tsx` |
| `/member/groups` | `http://applecorp.localhost:3001/member/groups` | `(dashboard)/member/groups/page.tsx` |
| `/member/sessions` | `http://applecorp.localhost:3001/member/sessions` | `(dashboard)/member/sessions/page.tsx` |
| `/member/security` | `http://applecorp.localhost:3001/member/security` | `(dashboard)/member/security/page.tsx` |
| `/member/profile` | `http://applecorp.localhost:3001/member/profile` | `(dashboard)/member/profile/page.tsx` |

### Organization Routes (`[tenant]/org/[orgSlug]/`)

| Route | Example URL | File |
|---|---|---|
| `/org/{orgSlug}` | `http://applecorp.localhost:3001/org/nutracorp` | `org/[orgSlug]/page.tsx` |
| `/org/{orgSlug}/users` | `http://applecorp.localhost:3001/org/nutracorp/users` | `org/[orgSlug]/users/page.tsx` |
| `/org/{orgSlug}/users/{userId}` | `http://applecorp.localhost:3001/org/nutracorp/users/u_123` | `org/[orgSlug]/users/[userId]/page.tsx` |
| `/org/{orgSlug}/groups` | `http://applecorp.localhost:3001/org/nutracorp/groups` | `org/[orgSlug]/groups/page.tsx` |
| `/org/{orgSlug}/groups/{groupId}` | `http://applecorp.localhost:3001/org/nutracorp/groups/g_456` | `org/[orgSlug]/groups/[groupId]/page.tsx` |
| `/org/{orgSlug}/applications` | `http://applecorp.localhost:3001/org/nutracorp/applications` | `org/[orgSlug]/applications/page.tsx` |
| `/org/{orgSlug}/roles` | `http://applecorp.localhost:3001/org/nutracorp/roles` | `org/[orgSlug]/roles/page.tsx` |
| `/org/{orgSlug}/permissions` | `http://applecorp.localhost:3001/org/nutracorp/permissions` | `org/[orgSlug]/permissions/page.tsx` |
| `/org/{orgSlug}/service-accounts` | `http://applecorp.localhost:3001/org/nutracorp/service-accounts` | `org/[orgSlug]/service-accounts/page.tsx` |
| `/org/{orgSlug}/policies` | `http://applecorp.localhost:3001/org/nutracorp/policies` | `org/[orgSlug]/policies/page.tsx` |
| `/org/{orgSlug}/sessions` | `http://applecorp.localhost:3001/org/nutracorp/sessions` | `org/[orgSlug]/sessions/page.tsx` |
| `/org/{orgSlug}/access-requests` | `http://applecorp.localhost:3001/org/nutracorp/access-requests` | `org/[orgSlug]/access-requests/page.tsx` |
| `/org/{orgSlug}/billing` | `http://applecorp.localhost:3001/org/nutracorp/billing` | `org/[orgSlug]/billing/page.tsx` |
| `/org/{orgSlug}/settings` | `http://applecorp.localhost:3001/org/nutracorp/settings` | `org/[orgSlug]/settings/page.tsx` |
| `/org/{orgSlug}/branding` | `http://applecorp.localhost:3001/org/nutracorp/branding` | `org/[orgSlug]/branding/page.tsx` |
| `/org/{orgSlug}/integrations` | `http://applecorp.localhost:3001/org/nutracorp/integrations` | `org/[orgSlug]/integrations/page.tsx` |

### Meal Service Routes (`[tenant]/org/[orgSlug]/meal-service/`)

Pages that render role-aware content (owner/admin/member) branch internally; the URL and file are the same for all roles.

| Route | Example URL | File | Notes |
|---|---|---|---|
| `/org/{orgSlug}/meal-service` | `http://applecorp.localhost:3001/org/nutracorp/meal-service` | `meal-service/page.tsx` | Weekly meal planner / calendar with PDF & CSV export |
| `/org/{orgSlug}/meal-service/dashboard` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/dashboard` | `meal-service/dashboard/page.tsx` | Role-aware dashboard: `OwnerAdminDashboard` or `MemberDashboard` |
| `/org/{orgSlug}/meal-service/analytics` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/analytics` | `meal-service/analytics/page.tsx` | Rich analytics: 6 stat cards, dual-axis area chart, status donut, top plans bar, top meals table, orders by day, location table, customer growth/retention, segments pie |
| `/org/{orgSlug}/meal-service/cost-generation` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/cost-generation` | `meal-service/cost-generation/page.tsx` | Upload receipt → extract items → cost per meal estimate, cost breakdown pie, paid calculations, tips sidebar |
| `/org/{orgSlug}/meal-service/billing` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/billing` | `meal-service/billing/page.tsx` | My Bill: 4 stat cards, billing overview area chart (plan/paid/outstanding), paginated invoice table, account summary, payment methods, outstanding alert |
| `/org/{orgSlug}/meal-service/claims` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/claims` | `meal-service/claims/page.tsx` | |
| `/org/{orgSlug}/meal-service/customers` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/customers` | `meal-service/customers/page.tsx` | |
| `/org/{orgSlug}/meal-service/ingredients` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/ingredients` | `meal-service/ingredients/page.tsx` | |
| `/org/{orgSlug}/meal-service/members` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/members` | `meal-service/members/page.tsx` | |
| `/org/{orgSlug}/meal-service/menus` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/menus` | `meal-service/menus/page.tsx` | Also aliased via `/recepe` (see below) |
| `/org/{orgSlug}/meal-service/nutrition` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/nutrition` | `meal-service/nutrition/page.tsx` | |
| `/org/{orgSlug}/meal-service/notifications` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/notifications` | `meal-service/notifications/page.tsx` | Notification centre: tab filters (All/Unread/Read/type), search+priority filter, paginated list with mark-as-read, summary sidebar, by-channel pie, quick actions |
| `/org/{orgSlug}/meal-service/order-history` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/order-history` | `meal-service/order-history/page.tsx` | 6 stat cards, searchable+filterable table with customer avatars, pagination, order overview donut sidebar, quick actions |
| `/org/{orgSlug}/meal-service/orders` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/orders` | `meal-service/orders/page.tsx` | |
| `/org/{orgSlug}/meal-service/plans` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/plans` | `meal-service/plans/page.tsx` | Role-aware: `OwnerAdminView` or `MemberView` |
| `/org/{orgSlug}/meal-service/plans/new` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/plans/new` | `meal-service/plans/new/page.tsx` | |
| `/org/{orgSlug}/meal-service/planner` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/planner` | `meal-service/planner/page.tsx` | Weekly planner view |
| `/org/{orgSlug}/meal-service/recepe` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/recepe` | `meal-service/recepe/page.tsx` | Re-exports `menus/page.tsx`; URL typo intentional (matches nav href) |
| `/org/{orgSlug}/meal-service/reports` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/reports` | `meal-service/reports/page.tsx` | 3-tab layout: Overview (charts + revenue summary table), Templates (generate/download), Custom Reports (scheduled report configs) |
| `/org/{orgSlug}/meal-service/reviews` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/reviews` | `meal-service/reviews/page.tsx` | |
| `/org/{orgSlug}/meal-service/settings` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/settings` | `meal-service/settings/page.tsx` | 6-tab settings (Organization, Meal Service, Payment, Notifications, Preferences, Integrations); storage pie, subscription card, system info |
| `/org/{orgSlug}/meal-service/today` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/today` | `meal-service/today/page.tsx` | |
| `/org/{orgSlug}/meal-service/tracking` | `http://applecorp.localhost:3001/org/nutracorp/meal-service/tracking` | `meal-service/tracking/page.tsx` | |

---

## Navigation UI Primitives (`src/components/ui/Navigation/`)

| Component | File | Notes |
|---|---|---|
| `<Tabs>` | `Tabs.tsx` | variants: `underline`, `pills`, `cards`; sizes: `sm`, `md`; supports icons, badges, disabled |
| `<Breadcrumb>` | `Breadcrumb.tsx` | optional home icon, ChevronRight separators, link items with icons |

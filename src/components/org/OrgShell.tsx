"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import {
  AppWindow,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  Gavel,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MonitorSmartphone,
  Palette,
  Plug,
  Search,
  Server,
  Settings,
  ShieldCheck,
  UtensilsCrossed,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  PreviewUserProvider,
  PREVIEW_USERS,
  usePreviewUser,
  type PreviewRole,
} from "./PreviewUserContext";

interface OrgNavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  disabled?: boolean;
}

interface OrgNavSection {
  label: string;
  roles: PreviewRole[];
  items: (OrgNavItem & { roles?: PreviewRole[] })[];
}

function buildNavSections(orgSlug: string): OrgNavSection[] {
  const base = `/org/${orgSlug}`;
  return [
    {
      label: "Organization",
      roles: ["owner", "admin", "moderator", "member"],
      items: [
        { label: "Users",            icon: Users,            href: `${base}/users`,            roles: ["owner", "admin", "moderator", "member"] },
        { label: "Groups",           icon: UsersRound,       href: `${base}/groups`,           roles: ["owner", "admin", "moderator", "member"] },
        { label: "Applications",     icon: AppWindow,        href: `${base}/applications`,     roles: ["owner", "admin", "moderator", "member"] },
        { label: "Roles",            icon: ShieldCheck,      href: `${base}/roles`,            roles: ["owner", "admin", "moderator"] },
        { label: "Permissions",      icon: KeyRound,         href: `${base}/permissions`,      roles: ["owner", "admin", "moderator"] },
        { label: "Service Accounts", icon: Server,           href: `${base}/service-accounts`, roles: ["owner", "admin"] },
      ],
    },
    {
      label: "Access & Security",
      roles: ["owner", "admin", "moderator"],
      items: [
        { label: "Policies",        icon: Gavel,             href: `${base}/policies`         },
        { label: "Sessions",        icon: MonitorSmartphone, href: `${base}/sessions`         },
        { label: "Access Requests", icon: ShieldCheck,       href: `${base}/access-requests` },
      ],
    },
    {
      label: "Billing & Settings",
      roles: ["owner"],
      items: [
        { label: "Subscriptions & Billing", icon: CreditCard, href: `${base}/billing`  },
        { label: "Organization Settings",   icon: Settings,   href: `${base}/settings` },
        { label: "Branding",                icon: Palette,    href: `${base}/branding`      },
        { label: "Integrations",            icon: Plug,       href: `${base}/integrations`  },
      ],
    },
    {
      label: "Services",
      roles: ["owner", "admin", "moderator", "member"],
      items: [
        { label: "Meal Service", icon: UtensilsCrossed, href: `${base}/meal-service/dashboard`, roles: ["owner", "admin", "moderator", "member"] },
      ],
    },
  ];
}

function NavLink({ item, isActive }: { item: OrgNavItem; isActive: boolean }) {
  const Icon = item.icon;
  if (item.disabled) {
    return (
      <div className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400">
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
          {item.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
          Soon
        </span>
      </div>
    );
  }
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} strokeWidth={2} />
      {item.label}
    </Link>
  );
}

/* ── User Switcher dropdown ─────────────────────────────────────────────── */
function UserSwitcher() {
  const { currentUser, setCurrentUser } = usePreviewUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 hover:bg-slate-100 transition-colors"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${currentUser.avatarBg} text-xs font-semibold text-white`}>
          {currentUser.initials}
        </div>
        <div className="hidden sm:flex sm:flex-col sm:items-start">
          <span className="text-xs font-medium leading-tight text-slate-700">{currentUser.name}</span>
          <span className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${currentUser.badgeBg} ${currentUser.badgeText}`}>
            {currentUser.roleLabel}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <p className="mb-1 px-2.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Preview as
            </p>
            {PREVIEW_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setCurrentUser(u); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  u.id === currentUser.id ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${u.avatarBg} text-xs font-semibold text-white`}>
                  {u.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                {u.id === currentUser.id && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.badgeBg} ${u.badgeText}`}>
                    {u.roleLabel}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Inner shell (needs context) ────────────────────────────────────────── */
function OrgShellInner({ children }: { children: ReactNode }) {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Meal-service has its own dedicated shell — pass through to avoid double sidebars
  if (pathname.includes("/meal-service")) {
    return <>{children}</>;
  }

  const overviewHref = `/org/${orgSlug}`;
  const navSections = buildNavSections(orgSlug);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
        isCollapsed ? "w-20" : "w-64"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-100 px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Image src="/logo.jpeg" alt="NutraTenant" width={34} height={34} className="shrink-0 rounded-full object-cover" />
            {!isCollapsed && (
              <div className="truncate leading-tight">
                <p className="truncate text-sm font-bold tracking-tight text-slate-900">NutraTenant</p>
                <p className="truncate text-[10px] text-slate-400">Multi-Tenancy Microservice</p>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-slate-700 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Org badge */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400">Active Organization</p>
            <p className="mt-0.5 truncate text-sm font-semibold capitalize text-indigo-900">
              {orgSlug.replace(/-/g, " ")}
            </p>
          </div>
        )}

        {/* Overview */}
        <div className="mt-3 px-3">
          <Link
            href={overviewHref}
            title={isCollapsed ? "Overview" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === overviewHref
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 shrink-0 ${pathname === overviewHref ? "text-white" : "text-slate-400"}`} strokeWidth={2} />
            {!isCollapsed && "Overview"}
          </Link>
        </div>

        {/* All nav sections visible in preview mode regardless of role */}
        <nav className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-2">
          {navSections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {section.label}
                </span>
              )}
              {section.items.map((item) => (
                <NavLink key={item.label} item={item} isActive={isActive(item.href)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Help card */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-indigo-400" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-slate-800">Need Help?</span>
            </div>
            <p className="mb-2.5 text-[11px] leading-relaxed text-slate-500">
              Contact support or request access to a new application.
            </p>
            <Link
              href="/support"
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Contact Support
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="hidden items-center justify-center gap-2 border-t border-slate-100 px-3 py-3 text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700 lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!isCollapsed && "Collapse"}
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button type="button" onClick={() => setIsMobileOpen(true)} className="text-slate-400 hover:text-slate-700 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, groups, applications, permissions..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
              <Calendar className="h-3.5 w-3.5" />
              May 30 – Jun 26, 2026
            </span>
            <button type="button" className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:flex">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button type="button" className="text-slate-400 hover:text-slate-600">
              <Bell className="h-4 w-4" />
            </button>
            {/* User switcher — replaces the static avatar */}
            <UserSwitcher />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

/* ── Public export — provides context then renders shell ────────────────── */
export default function OrgShell({ children }: { children: ReactNode }) {
  return (
    <PreviewUserProvider>
      <OrgShellInner>{children}</OrgShellInner>
    </PreviewUserProvider>
  );
}

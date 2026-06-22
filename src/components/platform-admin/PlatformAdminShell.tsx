"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Fingerprint,
  Gavel,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { PLATFORM_ADMIN_TOKEN_COOKIE_NAME } from "@/core/platformAdmin/types";

interface PlatformNavItem {
  label: string;
  icon: LucideIcon;
  enabled: boolean;
  href?: string;
}

interface PlatformNavGroup {
  label: string;
  items: PlatformNavItem[];
}

const NAV_GROUPS: readonly PlatformNavGroup[] = [
  {
    label: "Platform Management",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, enabled: true, href: "/admin/dashboard" },
      { label: "Tenants", icon: Building2, enabled: false },
      { label: "Plans & Features", icon: CreditCard, enabled: false },
      { label: "Tenant Provisioning", icon: PlusCircle, enabled: false },
    ],
  },
  {
    label: "Access Control",
    items: [
      { label: "Users", icon: Users, enabled: false },
      { label: "Roles", icon: ShieldCheck, enabled: false },
      { label: "Permissions", icon: KeyRound, enabled: false },
      { label: "Policies (ABAC)", icon: Gavel, enabled: false },
      { label: "MFA Policies", icon: Fingerprint, enabled: false },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Audit Logs", icon: ScrollText, enabled: false },
      { label: "System Settings", icon: Settings, enabled: false },
    ],
  },
];

interface PlatformAdminShellProps {
  adminEmail: string;
  adminId: string;
  children: ReactNode;
}

function clearPlatformAdminSession(): void {
  document.cookie = `${PLATFORM_ADMIN_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.location.href = "/admin/login";
}

export default function PlatformAdminShell({ adminEmail, adminId, children }: PlatformAdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-200 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-green-600 text-green-600">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="truncate text-sm font-semibold tracking-tight text-slate-900">NutraTenant</p>
                <p className="truncate text-[10px] text-slate-500">Multi-Tenant IAM Platform</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!isCollapsed && (
                <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </span>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;

                if (!item.enabled) {
                  return (
                    <div
                      key={item.label}
                      className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                        {!isCollapsed && item.label}
                      </span>
                      {!isCollapsed && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Soon
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    title={isCollapsed ? item.label : undefined}
                    className="flex items-center gap-3 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {!isCollapsed && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-700">System Status</p>
                <p className="text-[11px] text-slate-500">All systems operational</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="hidden items-center justify-center gap-2 border-t border-slate-200 px-3 py-3 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!isCollapsed && "Collapse"}
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="text-slate-400 hover:text-slate-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants, users, roles, audit logs..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
              <Calendar className="h-3.5 w-3.5" />
              May 20 - Jun 20, 2026
            </span>

            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:flex"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button type="button" className="text-slate-400 hover:text-slate-600">
              <Bell className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-xs font-medium text-slate-700 sm:block">{adminEmail}</span>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                Super Admin
              </span>
            </div>

            <button
              type="button"
              onClick={clearPlatformAdminSession}
              title={`Log out (${adminId})`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

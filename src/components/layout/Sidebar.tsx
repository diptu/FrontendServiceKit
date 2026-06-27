"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  ShieldCheck,
  ScrollText,
  Building2,
  Wallet,
  Crown,
  Gavel,
  UserCircle,
  Layers,
  AppWindow,
  UsersRound,
  Fingerprint,
  MonitorSmartphone,
  UserRound,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import AllowedFor from "@/components/auth/AllowedFor";
import type { JWTClaims } from "@/core/auth/authService";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

// Tenant identity now comes from the hostname (see src/middleware.ts), so
// every link here is a plain, same-origin path -- no /[tenant] URL prefix.
const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard, enabled: true },
  { label: "User Access Forms", href: "/users", icon: Users, enabled: true },
  { label: "Token Policies", href: "/policies", icon: KeyRound, enabled: true },
  { label: "Plans & Features", href: "/plans-features", icon: Layers, enabled: true },
  { label: "API Scopes", href: "/scopes", icon: ShieldCheck, enabled: false },
  { label: "Audit Logs", href: "/audit", icon: ScrollText, enabled: false },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Organization Roster", href: "/admin/roster", icon: Building2, enabled: true },
  { label: "Credit Balance Adjustments", href: "/admin/credit-adjustments", icon: Wallet, enabled: true },
  { label: "Security Audit Log", href: "/audit-logs", icon: ScrollText, enabled: true },
];

interface WorkspaceTierLink {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: JWTClaims["role"][];
}

const WORKSPACE_TIER_LINKS: WorkspaceTierLink[] = [
  { label: "Admin Workspace",     href: "/admin",     icon: Crown,      allowedRoles: ["ADMIN"] },
  { label: "Moderator Workspace", href: "/moderator", icon: Gavel,      allowedRoles: ["ADMIN", "MODERATOR"] },
  { label: "Member Workspace",    href: "/member",    icon: UserCircle, allowedRoles: ["ADMIN", "MODERATOR", "MEMBER"] },
];

const MEMBER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/member",              icon: LayoutDashboard,  enabled: true  },
  { label: "My Applications", href: "/member/applications", icon: AppWindow,        enabled: true  },
  { label: "My Groups",       href: "/member/groups",       icon: UsersRound,       enabled: true  },
  { label: "MFA & Security",  href: "/member/security",     icon: Fingerprint,      enabled: true  },
  { label: "My Sessions",     href: "/member/sessions",     icon: MonitorSmartphone,enabled: true  },
  { label: "My Profile",      href: "/member/profile",      icon: UserRound,        enabled: true  },
  { label: "Support",         href: "/support",             icon: LifeBuoy,         enabled: false },
];

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <Image
          src="/logo.jpeg"
          alt="NutraTenant IAM logo"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <span className="text-base font-semibold tracking-tight text-white">
          NutraTenant IAM
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Soon
                </span>
              </div>
            );
          }

          return <NavLink key={item.label} item={item} isActive={isActive} />;
        })}

        <div className="mt-2 flex flex-col gap-1 border-t border-slate-800 pt-2">
          <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Workspace Tiers
          </span>
          {WORKSPACE_TIER_LINKS.map((link) => (
            <AllowedFor key={link.label} roles={link.allowedRoles}>
              <NavLink
                item={{ label: link.label, href: link.href, icon: link.icon, enabled: true }}
                isActive={pathname === link.href}
              />
            </AllowedFor>
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-1 border-t border-slate-800 pt-2">
          <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            My Workspace
          </span>
          {MEMBER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Soon
                  </span>
                </div>
              );
            }
            const isActive = item.href === "/member"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return <NavLink key={item.label} item={item} isActive={isActive} />;
          })}
        </div>

        <AllowedFor roles={["ADMIN"]}>
          <div className="mt-2 flex flex-col gap-1 border-t border-slate-800 pt-2">
            <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Admin Operations
            </span>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink key={item.label} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + "/")} />
            ))}
          </div>
        </AllowedFor>
      </nav>

      {/* Need Help? card */}
      <div className="mx-3 mb-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-indigo-400" strokeWidth={1.8} />
          <span className="text-xs font-semibold text-white">Need Help?</span>
        </div>
        <p className="mb-2.5 text-[11px] leading-relaxed text-slate-400">
          Contact support or request access to a new application.
        </p>
        <Link
          href="/support"
          className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Request Access
        </Link>
      </div>

      <div className="border-t border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin Desk</span>
            <span className="text-xs text-slate-400">Root Tenant</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

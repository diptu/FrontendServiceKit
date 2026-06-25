"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AppWindow,
  UsersRound,
  UserRound,
  Fingerprint,
  MonitorSmartphone,
  ScrollText,
  LifeBuoy,
  X,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/member",              icon: LayoutDashboard   },
  { label: "My Applications", href: "/member/applications", icon: AppWindow         },
  { label: "My Groups",       href: "/member/groups",       icon: UsersRound        },
  { label: "My Profile",      href: "/member/profile",      icon: UserRound         },
  { label: "MFA & Security",  href: "/member/security",     icon: Fingerprint       },
  { label: "Sessions",        href: "/member/sessions",     icon: MonitorSmartphone },
];

const SUPPORT_ITEMS: NavItem[] = [
  { label: "Audit Log", href: "/member/audit",   icon: ScrollText, disabled: true },
  { label: "Support",   href: "/member/support", icon: LifeBuoy,   disabled: true },
];

function MemberSidebar() {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(true);

  function isActive(href: string) {
    return href === "/member"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
        <Image
          src="/logo.jpeg"
          alt="NutraTenant"
          width={34}
          height={34}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-slate-900">NutraTenant</span>
          <span className="text-[10px] text-slate-400">Multi-Tenancy Microservices</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Support section */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Support
          </span>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {SUPPORT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2} />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Need Help? card */}
      {helpOpen ? (
        <div className="mx-3 mb-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-indigo-500" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-indigo-900">Need Help?</span>
            </div>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="rounded-md p-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
              aria-label="Close help card"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
          <p className="mb-2.5 text-[11px] leading-relaxed text-indigo-600/70">
            Contact support or request access to a new application.
          </p>
          <Link
            href="/member/applications"
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Request Access
          </Link>
        </div>
      ) : (
        <div className="mx-3 mb-3">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
          >
            <LifeBuoy className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            Need Help?
          </button>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-slate-100 px-4 py-3.5">
        <Link
          href="/member/profile"
          className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            JD
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">John Doe</p>
            <p className="truncate text-[11px] text-slate-400">john.doe@apple.test</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

interface MemberShellProps {
  children: ReactNode;
}

export default function MemberShell({ children }: MemberShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <MemberSidebar />
      <main className="flex-1 overflow-y-auto px-10 py-8">{children}</main>
    </div>
  );
}

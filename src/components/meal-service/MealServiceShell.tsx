"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileBarChart,
  HelpCircle,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListOrdered,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Truck,
  UtensilsCrossed,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  PreviewUserProvider,
  PREVIEW_USERS,
  usePreviewUser,
} from "@/components/org/PreviewUserContext";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";

/* ── Nav types ──────────────────────────────────────────────────────────── */

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Full nav — union of all staff and member items, sorted A→Z per section
function buildFullNav(base: string): NavSection[] {
  return [
    {
      label: "Main Menu",
      items: [
        { label: "Analytics",         icon: BarChart3,       href: `${base}/analytics`     },
        { label: "Customers",         icon: Users,           href: `${base}/customers`     },
        { label: "Delivery Tracking", icon: Truck,           href: `${base}/tracking`      },
        { label: "Ingredients",       icon: Package,         href: `${base}/ingredients`   },
        { label: "Meal Plans",        icon: ClipboardList,   href: `${base}/plans`         },
        { label: "Members",           icon: Users,           href: `${base}/members`       },
        { label: "Menus",             icon: ListOrdered,     href: `${base}/menus`         },
        { label: "My Claims",         icon: History,         href: `${base}/claims`        },
        { label: "Nutrition",         icon: Activity,        href: `${base}/nutrition`     },
        { label: "Order History",     icon: ListOrdered,     href: `${base}/order-history` },
        { label: "Orders",            icon: ShoppingCart,    href: `${base}/orders`        },
        { label: "Overview",          icon: LayoutDashboard, href: `${base}`               },
        { label: "Recipes",           icon: BookOpen,        href: `${base}/recepe`        },
        { label: "Reports",           icon: FileBarChart,    href: `${base}/reports`       },
        { label: "Reviews",           icon: Star,            href: `${base}/reviews`       },
        { label: "Today's Meals",     icon: UtensilsCrossed, href: `${base}/today`         },
        { label: "Weekly Planner",    icon: Calendar,        href: `${base}/planner`       },
      ],
    },
    {
      label: "Settings",
      items: [
        { label: "Bills & Permissions", icon: CreditCard, href: `${base}/billing`  },
        { label: "System Settings",     icon: Settings,   href: `${base}/settings` },
      ],
    },
    {
      label: "Support",
      items: [
        { label: "Contact Support", icon: LifeBuoy,   href: `${base}/support` },
        { label: "FAQ & Support",   icon: HelpCircle, href: `${base}/faq`     },
      ],
    },
  ];
}

/* ── Nav link ───────────────────────────────────────────────────────────── */

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
        strokeWidth={2}
      />
      {item.label}
    </Link>
  );
}

/* ── User switcher ──────────────────────────────────────────────────────── */

function UserSwitcher() {
  const { currentUser, setCurrentUser } = usePreviewUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50 transition-colors"
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

/* ── Inner shell ────────────────────────────────────────────────────────── */

function MealServiceShellInner({ children }: { children: ReactNode }) {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const base = `/org/${orgSlug}/meal-service`;
  const sections = buildFullNav(base);

  function isActive(href: string) {
    if (href === base) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
          isCollapsed ? "w-[72px]" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-100 px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src="/logo.jpeg"
              alt="NutraTenant"
              width={32}
              height={32}
              className="shrink-0 rounded-full object-cover"
            />
            {!isCollapsed && (
              <div className="truncate leading-tight">
                <p className="truncate text-sm font-bold tracking-tight text-slate-900">NutraTenant</p>
                <p className="truncate text-[10px] text-slate-400">Meal Service</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User profile card */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${currentUser.avatarBg} text-xs font-semibold text-white`}>
                  {currentUser.initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900">{currentUser.name}</p>
                <span className={`mt-0.5 inline-flex rounded-full px-1.5 py-0 text-[10px] font-semibold ${currentUser.badgeBg} ${currentUser.badgeText}`}>
                  {currentUser.roleLabel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed — show just the avatar */}
        {isCollapsed && (
          <div className="flex justify-center pt-3">
            <div className="relative">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${currentUser.avatarBg} text-xs font-semibold text-white`}>
                {currentUser.initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
          </div>
        )}

        {/* Nav sections */}
        <nav className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => (
                <NavLink key={item.label} item={item} isActive={isActive(item.href)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Need Help? */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-indigo-400" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-slate-700">Need Help?</span>
            </div>
            <p className="mb-2.5 text-[11px] leading-relaxed text-slate-500">
              Contact support or request access to a new application.
            </p>
            <Link
              href={`/org/${orgSlug}/meal-service/support`}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Contact Support
            </Link>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="hidden items-center justify-center gap-2 border-t border-slate-100 px-3 py-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!isCollapsed && "Collapse"}
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
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
              placeholder="Search meals, orders, plans, members…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button type="button" className="relative text-slate-400 hover:text-slate-600">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <UserSwitcher />
          </div>
        </header>

        {/* Preview banner */}
        <div className="border-b border-amber-100 bg-amber-50 px-6 py-2">
          <PreviewBanner showIcon>
            Meal Service is in <strong>preview mode</strong> — all data is mock-only. Switch roles using the user switcher in the top-right.
          </PreviewBanner>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

/* ── Export ─────────────────────────────────────────────────────────────── */

export default function MealServiceShell({ children }: { children: ReactNode }) {
  return (
    <PreviewUserProvider>
      <MealServiceShellInner>{children}</MealServiceShellInner>
    </PreviewUserProvider>
  );
}

"use client";

import { useState } from "react";
import {
  UtensilsCrossed, Download, Plus, Search, Star,
  Users, CheckCircle, Tag, Pencil, Trash2, Archive,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { StatCard } from "@/components/ui";
import { Badge } from "@/components/ui";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface MealPlan {
  id: string;
  name: string;
  tagline: string;
  status: "Active" | "Inactive" | "Draft";
  mealsPerDay: number;
  caloriesPerDay: number;
  proteinPerDay: number;
  pricePerDay: number;
  goal: string;
  subscribers: number;
  rating: number;
  reviewCount: number;
  emoji: string;
  highlightLabel?: string;
}

/* ── Mock data ──────────────────────────────────────────────────────────── */

const MEAL_PLANS: MealPlan[] = [
  {
    id: "mp-001",
    name: "Balanced Plan",
    tagline: "Nutritionally balanced meals for everyday health.",
    status: "Active",
    mealsPerDay: 3,
    caloriesPerDay: 1800,
    proteinPerDay: 90,
    pricePerDay: 12.0,
    goal: "General Health",
    subscribers: 2847,
    rating: 4.8,
    reviewCount: 1243,
    emoji: "🥗",
    highlightLabel: "Most Popular",
  },
  {
    id: "mp-002",
    name: "High Protein Plan",
    tagline: "Maximize muscle growth with protein-rich meals.",
    status: "Active",
    mealsPerDay: 4,
    caloriesPerDay: 2200,
    proteinPerDay: 180,
    pricePerDay: 14.99,
    goal: "Muscle Building",
    subscribers: 1234,
    rating: 4.7,
    reviewCount: 856,
    emoji: "🍗",
    highlightLabel: "Best for Athletes",
  },
  {
    id: "mp-003",
    name: "Low Carb Plan",
    tagline: "Reduce carbs and support sustainable weight loss.",
    status: "Active",
    mealsPerDay: 3,
    caloriesPerDay: 1500,
    proteinPerDay: 120,
    pricePerDay: 12.49,
    goal: "Weight Management",
    subscribers: 982,
    rating: 4.5,
    reviewCount: 634,
    emoji: "🥦",
    highlightLabel: "Editor's Pick",
  },
  {
    id: "mp-004",
    name: "Vegetarian Plan",
    tagline: "100% plant-based, ethically sourced ingredients.",
    status: "Active",
    mealsPerDay: 3,
    caloriesPerDay: 1600,
    proteinPerDay: 75,
    pricePerDay: 13.99,
    goal: "Plant-based",
    subscribers: 645,
    rating: 4.6,
    reviewCount: 412,
    emoji: "🌱",
    highlightLabel: "Eco-Friendly",
  },
  {
    id: "mp-005",
    name: "Keto Diet Plan",
    tagline: "High-fat, low-carb meals to maintain ketosis.",
    status: "Active",
    mealsPerDay: 4,
    caloriesPerDay: 1700,
    proteinPerDay: 130,
    pricePerDay: 15.99,
    goal: "Weight Loss",
    subscribers: 523,
    rating: 4.4,
    reviewCount: 318,
    emoji: "🥑",
  },
  {
    id: "mp-006",
    name: "Mediterranean Diet",
    tagline: "Heart-healthy meals inspired by Mediterranean cuisine.",
    status: "Inactive",
    mealsPerDay: 3,
    caloriesPerDay: 1900,
    proteinPerDay: 85,
    pricePerDay: 16.99,
    goal: "Heart Health",
    subscribers: 289,
    rating: 4.3,
    reviewCount: 201,
    emoji: "🫒",
  },
];

/* ── Shared small components ───────────────────────────────────────────── */

function PlanStatusBadge({ status }: { status: MealPlan["status"] }) {
  if (status === "Active") return <Badge variant="success" dot>Active</Badge>;
  if (status === "Draft") return <Badge variant="warning" dot>Draft</Badge>;
  return <Badge variant="muted" dot>Inactive</Badge>;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold text-slate-800">{rating}</span>
      <span className="text-[10px] text-slate-400">({count.toLocaleString()})</span>
    </div>
  );
}

/* ── Staff view (Admin + Moderator) ─────────────────────────────────────── */

const PLAN_CATEGORIES = [
  { label: "General Health", count: 12, color: "bg-indigo-400" },
  { label: "Performance",    count: 8,  color: "bg-violet-400" },
  { label: "Weight Loss",    count: 6,  color: "bg-rose-400"   },
  { label: "Lifestyle",      count: 4,  color: "bg-emerald-400"},
  { label: "Specialty",      count: 2,  color: "bg-amber-400"  },
];

const ADMIN_STATS  = { total: 32, active: 26, categories: 6, subscribers: 6842, rating: 4.6, reviewLabel: "3.8k reviews" };
const MOD_STATS    = { total: 26, active: 20, categories: 4, subscribers: 3456, rating: 4.6, reviewLabel: "2.1k reviews" };

function StaffView({ role }: { role: "ADMIN" | "MODERATOR" }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isAdmin = role === "ADMIN";
  const stats   = isAdmin ? ADMIN_STATS : MOD_STATS;
  const plans   = isAdmin ? MEAL_PLANS  : MEAL_PLANS.filter((p) => p.status === "Active").slice(0, 5);

  const filtered = plans.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!q || p.name.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q)) &&
      (statusFilter === "All" || p.status === statusFilter)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meal Plans</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Create, manage and oversee all meal plans across the organization."
              : "Manage and oversee all meal plans available in the organization."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Export Plans
          </button>
          {isAdmin && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add New Plan
            </button>
          )}
        </div>
      </div>

      {/* Preview banner */}
      <PreviewBanner showIcon>
        Meal Service is in preview — open to all users. All data shown is mock-only.
      </PreviewBanner>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={UtensilsCrossed} label="Total Meal Plans"    value={stats.total}                          sub="All meal plans"        color="indigo" />
        <StatCard icon={CheckCircle}     label="Active Plans"        value={stats.active}                         trend={`${Math.round((stats.active / stats.total) * 100)}% of total`} trendUp color="emerald" />
        <StatCard icon={Tag}             label="Categories"          value={stats.categories}                     sub="All types"             color="violet" />
        <StatCard icon={Users}           label="Total Subscribers"   value={stats.subscribers.toLocaleString()}   sub="Across all plans"      color="sky"    />
        <StatCard icon={Star}            label="Avg. Rating"         value={stats.rating}                         sub={`From ${stats.reviewLabel}`} color="amber" />
      </div>

      {/* Main: table + side panels */}
      <div className="flex gap-5">
        {/* Table */}
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
            <div className="relative min-w-0 flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search meal plans…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Draft</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>All Goals</option>
              <option>General Health</option>
              <option>Muscle Building</option>
              <option>Weight Management</option>
              <option>Plant-based</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="w-8 px-4 py-3"><input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" /></th>
                  <th className="px-4 py-3 text-left   text-[11px] font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                  <th className="px-3 py-3 text-left   text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-3 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-slate-500">Meals</th>
                  <th className="px-3 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cal</th>
                  <th className="px-3 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-slate-500">Protein</th>
                  <th className="px-3 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-slate-500">Price/Day</th>
                  <th className="px-3 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-slate-500">Price/Week</th>
                  <th className="px-3 py-3 text-left   text-[11px] font-semibold uppercase tracking-wide text-slate-500">Goal</th>
                  <th className="px-3 py-3 text-right  text-[11px] font-semibold uppercase tracking-wide text-slate-500">Subscribers</th>
                  <th className="px-3 py-3 text-left   text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rating</th>
                  <th className="w-16 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5"><input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
                          {plan.emoji}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-800">{plan.name}</p>
                            {plan.highlightLabel && (
                              <span className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600">
                                {plan.highlightLabel}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-slate-400">{plan.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><PlanStatusBadge status={plan.status} /></td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-600">{plan.mealsPerDay}/day</td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-600">{plan.caloriesPerDay.toLocaleString()}</td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-600">{plan.proteinPerDay}g</td>
                    <td className="px-3 py-3.5 text-right text-xs font-medium text-slate-800">${plan.pricePerDay.toFixed(2)}</td>
                    <td className="px-3 py-3.5 text-right text-xs font-medium text-slate-800">${(plan.pricePerDay * 7).toFixed(2)}</td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {plan.goal}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-600">{plan.subscribers.toLocaleString()}</td>
                    <td className="px-3 py-3.5"><StarRating rating={plan.rating} count={plan.reviewCount} /></td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        {isAdmin && (
                          <button type="button" className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">No meal plans match your filters.</p>
              </div>
            )}
          </div>

          {/* Footer pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {plans.length} plans
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                    n === 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <select className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>10 / page</option>
              <option>25 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>

        {/* Right side panels */}
        <div className="flex w-56 shrink-0 flex-col gap-4">
          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {isAdmin && (
                <button type="button" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  Add New Plan
                </button>
              )}
              <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Pencil className="h-3.5 w-3.5 text-slate-400" />
                Edit Meal Plan
              </button>
              <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                Manage Categories
              </button>
              {isAdmin && (
                <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Archive className="h-3.5 w-3.5 text-slate-400" />
                  Archive Plan
                </button>
              )}
            </div>
          </div>

          {/* Plan Categories */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan Categories</h3>
            <div className="flex flex-col gap-2">
              {PLAN_CATEGORIES.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cat.color}`} />
                    <span className="text-xs text-slate-600">{cat.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Performance */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan Performance</h3>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] text-slate-400">Most Subscribed</p>
                <p className="text-xs font-semibold text-slate-800">Balanced Plan</p>
                <p className="text-[10px] text-emerald-600">2,847 subscribers</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Highest Rated</p>
                <p className="text-xs font-semibold text-slate-800">Balanced Plan</p>
                <p className="text-[10px] text-amber-600">★ 4.8 (1,243 reviews)</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] text-slate-400">Cancellations</p>
                <p className="text-xs font-semibold text-slate-800">24 this month</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">New Signups</p>
                <p className="text-xs font-semibold text-slate-800">156 this month</p>
                <p className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +12% vs last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Member view ─────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: "✅", label: "Nutritionist Approved" },
  { icon: "🔄", label: "Flexible & Convenient" },
  { icon: "🎛️", label: "Customizable" },
  { icon: "🚚", label: "No Min Delivery" },
  { icon: "💰", label: "Best Value" },
];

const COMPARISON_FIELDS: { key: keyof MealPlan; label: string }[] = [
  { key: "mealsPerDay",    label: "Meals / Day"    },
  { key: "caloriesPerDay", label: "Calories / Day" },
  { key: "proteinPerDay",  label: "Protein / Day"  },
  { key: "pricePerDay",    label: "Price / Day"    },
  { key: "goal",           label: "Goal"           },
  { key: "rating",         label: "Rating"         },
];

function formatComparisonValue(field: keyof MealPlan, value: MealPlan[keyof MealPlan]): string {
  if (field === "pricePerDay")    return `$${(value as number).toFixed(2)}`;
  if (field === "caloriesPerDay") return `${(value as number).toLocaleString()} kcal`;
  if (field === "proteinPerDay")  return `${value}g`;
  if (field === "mealsPerDay")    return `${value} meals`;
  if (field === "rating")         return `★ ${value}`;
  return String(value);
}

function MemberView() {
  const featured = MEAL_PLANS.filter((p) => p.highlightLabel);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meal Plans</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose a meal plan that fits your goals and lifestyle.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <UtensilsCrossed className="h-4 w-4" strokeWidth={2} />
          Browse Plans
        </button>
      </div>

      {/* Preview banner */}
      <PreviewBanner showIcon>
        Meal Service is in preview — browse plans and explore features. Ordering is not yet available.
      </PreviewBanner>

      {/* Feature highlights */}
      <div className="flex flex-wrap items-center gap-2">
        {FEATURES.map((f) => (
          <span
            key={f.label}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
          >
            <span>{f.icon}</span>
            {f.label}
          </span>
        ))}
        <a href="#plan-comparison" className="ml-auto self-center text-xs font-medium text-indigo-600 hover:text-indigo-500">
          View all plans →
        </a>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featured.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <span className="text-5xl">{plan.emoji}</span>
              {plan.highlightLabel && (
                <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {plan.highlightLabel}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{plan.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span>🍽️ {plan.mealsPerDay} meals/day</span>
                <span>🔥 {plan.caloriesPerDay.toLocaleString()} cal</span>
                <span>💪 {plan.proteinPerDay}g protein</span>
              </div>
              <div className="mt-auto pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xl font-bold text-slate-900">${plan.pricePerDay.toFixed(2)}</span>
                    <span className="ml-1 text-xs text-slate-400">/day</span>
                  </div>
                  <StarRating rating={plan.rating} count={plan.reviewCount} />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Select Plan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan comparison table */}
      <div id="plan-comparison" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-800">Plan Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-36 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Feature
                </th>
                {featured.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span className="mr-1">{p.emoji}</span>
                    {p.name.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COMPARISON_FIELDS.map((field) => (
                <tr key={field.key} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-xs font-medium text-slate-600">{field.label}</td>
                  {featured.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center text-xs text-slate-700">
                      {formatComparisonValue(field.key, p[field.key])}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 py-3" />
                {featured.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      Select
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Help box */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤔</span>
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Need Help Choosing?</h3>
            <p className="mt-1 text-xs text-indigo-700">
              Not sure which plan is right for you? Take our quick 2-minute quiz and get a personalized recommendation.
            </p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Try My Plan Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page entry point ───────────────────────────────────────────────────── */

export default function MealPlansPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const role = user?.role ?? "MEMBER";

  if (role === "MEMBER") {
    return <MemberView />;
  }

  return <StaffView role={role} />;
}

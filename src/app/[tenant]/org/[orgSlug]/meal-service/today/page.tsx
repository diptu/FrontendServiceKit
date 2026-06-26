"use client";

import { Flame, Dumbbell, Wheat, Droplets, Bike, Lightbulb, Clock, ChevronRight } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const MEALS = [
  {
    slot: "Breakfast", time: "8:00 AM", emoji: "🥣",
    name: "Overnight Oats & Mixed Berries", desc: "Oats soaked overnight with almond milk, topped with seasonal berries and a drizzle of honey.",
    cal: 420, protein: 18, carbs: 68, fat: 8, status: "delivered",
    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    action: "Rate Meal",
  },
  {
    slot: "Lunch", time: "12:30 PM", emoji: "🥗",
    name: "Grilled Chicken & Quinoa Salad", desc: "Juicy grilled chicken breast on a bed of quinoa with roasted vegetables and lemon tahini dressing.",
    cal: 580, protein: 42, carbs: 45, fat: 14, status: "out for delivery",
    statusStyle: "bg-sky-50 text-sky-700 border-sky-200",
    action: "Track Delivery",
  },
  {
    slot: "Dinner", time: "7:00 PM", emoji: "🍣",
    name: "Salmon with Steamed Vegetables", desc: "Atlantic salmon fillet with a medley of seasonal steamed vegetables and brown rice.",
    cal: 620, protein: 48, carbs: 38, fat: 22, status: "preparing",
    statusStyle: "bg-amber-50 text-amber-700 border-amber-200",
    action: "View Details",
  },
];

const NUTRITION = [
  { label: "Calories",  current: 1000, target: 1620, unit: "kcal", color: "bg-orange-500", pct: 62, icon: Flame    },
  { label: "Protein",   current: 60,   target: 108,  unit: "g",    color: "bg-indigo-500", pct: 56, icon: Dumbbell },
  { label: "Carbs",     current: 113,  target: 151,  unit: "g",    color: "bg-amber-500",  pct: 75, icon: Wheat    },
  { label: "Fat",       current: 22,   target: 44,   unit: "g",    color: "bg-rose-500",   pct: 50, icon: Droplets },
];

export default function TodayPage() {
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const totalCal = MEALS.reduce((s, m) => s + m.cal, 0);
  const totalProtein = MEALS.reduce((s, m) => s + m.protein, 0);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Today&apos;s Meals</h1>
          <p className="mt-0.5 text-sm text-slate-500">{date} · Here&apos;s what&apos;s on your plate today.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm">Refresh</Button>
          <Button size="sm" icon={ChevronRight} iconPosition="right">Full Plan</Button>
        </div>
      </FadeIn>

      {/* Summary chips */}
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StaggerItem>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">3</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Meals Planned</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-500">{totalCal.toLocaleString()}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Total Calories</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalProtein}g</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Total Protein</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Bike className="h-5 w-5 text-sky-500" />
              <p className="text-lg font-bold text-sky-600">1 Active</p>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Delivery</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Meal cards */}
      <SlideUp>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Today&apos;s Schedule</h2>
        <div className="flex flex-col gap-4">
          {MEALS.map(m => (
            <div key={m.slot} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-4xl border border-slate-100">
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{m.slot}</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />{m.time}
                    </span>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${m.statusStyle}`}>{m.status}</span>
                </div>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">{m.name}</h3>
                <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    <span className="font-semibold text-slate-900">{m.cal}</span> kcal
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Dumbbell className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-900">{m.protein}g</span> protein
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Wheat className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-semibold text-slate-900">{m.carbs}g</span> carbs
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-start">
                <Button variant="outline" size="sm">{m.action}</Button>
              </div>
            </div>
          ))}
        </div>
      </SlideUp>

      <SlideUp delay={0.08} className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Nutrition progress */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Nutrition Progress Today</h2>
          <p className="mt-0.5 text-xs text-slate-400">Based on meals delivered so far (Breakfast only)</p>
          <div className="mt-5 flex flex-col gap-5">
            {NUTRITION.map(n => {
              const Icon = n.icon;
              return (
                <div key={n.label}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{n.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {n.current} / {n.target} {n.unit}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100">
                    <div className={`h-2.5 rounded-full ${n.color} transition-all duration-700`} style={{ width: `${n.pct}%` }} />
                  </div>
                  <p className="mt-1 text-right text-xs text-slate-400">{n.pct}% of daily goal</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip + Quick actions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-indigo-900">Nutrition Tip</span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed">
              You&apos;re on track for today! Try to eat your dinner at least 2–3 hours before bed for better digestion and sleep quality. Staying hydrated throughout the day also improves nutrient absorption.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <button type="button" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700">My Meal Plans</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button type="button" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700">Track Delivery</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button type="button" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700">Order History</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button type="button" className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700">Nutrition Overview</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}

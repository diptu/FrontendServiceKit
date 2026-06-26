"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Copy, Filter, Plus, Download,
  CheckCircle2, AlertCircle, Clock, CalendarDays,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────── */

type MealSlot   = "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Beverage";
type DayLabel   = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type MealStatus = "booked" | "confirmed" | "pending" | "empty";

interface PlannerMeal {
  name:   string;
  emoji:  string;
  cal:    number;
  status: MealStatus;
  plan:   string;
}

type DayMeals = Partial<Record<MealSlot, PlannerMeal>>;

/* ── Constants ───────────────────────────────────────────────────────────── */

const DAYS: { label: DayLabel; date: number }[] = [
  { label:"Mon", date:23 }, { label:"Tue", date:24 }, { label:"Wed", date:25 },
  { label:"Thu", date:26 }, { label:"Fri", date:27 }, { label:"Sat", date:28 },
  { label:"Sun", date:29 },
];

const MEAL_SLOTS: MealSlot[] = ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverage"];

const SLOT_STYLE: Record<MealSlot, { bg: string; text: string; dot: string }> = {
  Breakfast: { bg:"bg-emerald-50", text:"text-emerald-700", dot:"bg-emerald-500" },
  Lunch:     { bg:"bg-orange-50",  text:"text-orange-700",  dot:"bg-orange-500"  },
  Dinner:    { bg:"bg-violet-50",  text:"text-violet-700",  dot:"bg-violet-500"  },
  Snacks:    { bg:"bg-sky-50",     text:"text-sky-700",     dot:"bg-sky-500"     },
  Beverage:  { bg:"bg-teal-50",    text:"text-teal-700",    dot:"bg-teal-500"    },
};

const STATUS_STYLE: Record<MealStatus, string> = {
  booked:    "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-slate-100 text-slate-500 border-slate-200",
  empty:     "",
};

const STATUS_LABEL: Record<MealStatus, string> = {
  booked:    "Booked",
  confirmed: "Confirmed",
  pending:   "Pending",
  empty:     "",
};

/* ── Mock planner grid data ──────────────────────────────────────────────── */

const GRID: Record<DayLabel, DayMeals> = {
  Mon: {
    Breakfast: { name:"High Protein Meal",       emoji:"🥚", cal:480, status:"confirmed", plan:"Athlete Pro"      },
    Lunch:     { name:"Grilled Chicken Salad",   emoji:"🥗", cal:420, status:"booked",    plan:"Balanced Plan"    },
    Dinner:    { name:"Salmon Teriyaki",          emoji:"🍣", cal:580, status:"booked",    plan:"Balanced Plan"    },
    Snacks:    { name:"Protein Bar",              emoji:"🍫", cal:210, status:"pending",   plan:"Athlete Pro"      },
    Beverage:  { name:"Green Smoothie",           emoji:"🥤", cal:180, status:"confirmed", plan:"Vegan Power"      },
  },
  Tue: {
    Breakfast: { name:"Overnight Oats",           emoji:"🥣", cal:380, status:"booked",    plan:"Balanced Plan"    },
    Lunch:     { name:"Quinoa Veggie Bowl",        emoji:"🍚", cal:460, status:"confirmed", plan:"Vegetarian Plan"  },
    Dinner:    { name:"Chicken Tikka Masala",      emoji:"🍛", cal:560, status:"booked",    plan:"High Protein"     },
    Snacks:    { name:"Mixed Nuts",                emoji:"🥜", cal:190, status:"confirmed", plan:"Keto Flex"        },
    Beverage:  { name:"Fresh Orange Juice",        emoji:"🍊", cal:110, status:"pending",   plan:"Balanced Plan"    },
  },
  Wed: {
    Breakfast: { name:"Avocado Toast",             emoji:"🥑", cal:340, status:"confirmed", plan:"Med. Plan"        },
    Lunch:     { name:"Lentil Soup",               emoji:"🍲", cal:310, status:"booked",    plan:"Vegan Power"      },
    Dinner:    { name:"Beef Stir Fry",             emoji:"🥩", cal:540, status:"booked",    plan:"High Protein"     },
    Snacks:    { name:"Hummus & Veggies",          emoji:"🥕", cal:160, status:"confirmed", plan:"Vegetarian Plan"  },
  },
  Thu: {
    Breakfast: { name:"Veggie Omelette",           emoji:"🍳", cal:320, status:"booked",    plan:"Balanced Plan"    },
    Lunch:     { name:"Poke Bowl",                 emoji:"🐟", cal:490, status:"confirmed", plan:"Med. Plan"        },
    Dinner:    { name:"Mushroom Risotto",           emoji:"🍄", cal:510, status:"pending",   plan:"Vegetarian Plan"  },
    Snacks:    { name:"Fruit Salad",               emoji:"🍓", cal:140, status:"booked",    plan:"Balanced Plan"    },
    Beverage:  { name:"Turmeric Latte",            emoji:"☕", cal:90,  status:"pending",   plan:"Detox Cleanse"    },
  },
  Fri: {
    Breakfast: { name:"Smoothie Bowl",             emoji:"🫐", cal:360, status:"confirmed", plan:"Vegan Power"      },
    Lunch:     { name:"Caesar Salad",              emoji:"🥬", cal:310, status:"booked",    plan:"Low Carb"         },
    Dinner:    { name:"Lamb Chops",                emoji:"🍖", cal:620, status:"booked",    plan:"High Protein"     },
    Snacks:    { name:"Yogurt Parfait",            emoji:"🍨", cal:200, status:"confirmed", plan:"Balanced Plan"    },
  },
  Sat: {
    Breakfast: { name:"Pancakes & Berries",        emoji:"🥞", cal:440, status:"booked",    plan:"Balanced Plan"    },
    Lunch:     { name:"Mediterranean Bowl",        emoji:"🫙", cal:480, status:"confirmed", plan:"Med. Plan"        },
    Dinner:    { name:"Grilled Salmon Plate",      emoji:"🐠", cal:590, status:"booked",    plan:"Keto Flex"        },
    Snacks:    { name:"Energy Balls",              emoji:"⚡", cal:170, status:"pending",   plan:"Athlete Pro"      },
    Beverage:  { name:"Cold Brew Coffee",          emoji:"🧋", cal:60,  status:"confirmed", plan:"Balanced Plan"    },
  },
  Sun: {
    Breakfast: { name:"French Toast",              emoji:"🍞", cal:420, status:"confirmed", plan:"Balanced Plan"    },
    Lunch:     { name:"Veggie Burrito",            emoji:"🌯", cal:470, status:"booked",    plan:"Vegetarian Plan"  },
    Dinner:    { name:"Spaghetti Bolognese",       emoji:"🍝", cal:600, status:"booked",    plan:"Balanced Plan"    },
    Snacks:    { name:"Trail Mix",                 emoji:"🍿", cal:230, status:"confirmed", plan:"Athlete Pro"      },
  },
};

/* ── Right-sidebar data ──────────────────────────────────────────────────── */

const PLAN_OVERVIEW = [
  { name:"On Track",         value:68, color:"#10b981" },
  { name:"Needs Review",     value:22, color:"#f97316" },
  { name:"Unscheduled",      value:15, color:"#e2e8f0" },
];
const TOTAL_PLANS = PLAN_OVERVIEW.reduce((s, d) => s + d.value, 0); // 105

const UPCOMING = [
  { title:"Protein Boost Day",    date:"Jun 24", Icon: CheckCircle2, iconCls:"text-emerald-500" },
  { title:"Vegan Menu Review",    date:"Jun 25", Icon: AlertCircle,  iconCls:"text-amber-500"  },
  { title:"Keto Plan Refresh",    date:"Jun 26", Icon: Clock,        iconCls:"text-sky-500"    },
  { title:"Community Lunch",      date:"Jun 27", Icon: CalendarDays, iconCls:"text-violet-500" },
  { title:"Weekend Meal Prep",    date:"Jun 28", Icon: CheckCircle2, iconCls:"text-emerald-500" },
];

const QUICK_ACTIONS = [
  { label:"Copy Last Week",   icon: Copy      },
  { label:"Bulk Approve",     icon: CheckCircle2 },
  { label:"Shift Conflicts",  icon: AlertCircle  },
  { label:"Export Planner",   icon: Download  },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */

function FilterPill({ label }: { label: string }) {
  return (
    <button type="button"
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
    >
      {label}
      <ChevronDown className="h-3 w-3 text-slate-400" />
    </button>
  );
}

function MealCard({ meal }: { meal: PlannerMeal }) {
  return (
    <div className="group flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none">{meal.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold leading-tight text-slate-800">{meal.name}</p>
          <p className="text-[10px] text-slate-400">{meal.cal} kcal</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[9px] font-medium text-slate-400">{meal.plan}</span>
        {meal.status !== "empty" && (
          <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_STYLE[meal.status]}`}>
            {STATUS_LABEL[meal.status]}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyCell() {
  return (
    <button type="button"
      className="flex h-full min-h-[80px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-400"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function WeeklyPlannerPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const baseDate = 23 + weekOffset * 7;
  const weekDays = DAYS.map((d, i) => ({ ...d, date: baseDate + i }));

  return (
    <div className="flex gap-5">

      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Meal Planner</h1>
            <p className="mt-0.5 text-sm text-slate-500">Plan and schedule meals for your members</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              Copy Previous Week
            </button>
            <button type="button"
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </button>
          </div>
        </div>

        {/* Filter / week nav bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week navigator */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <button type="button" onClick={() => setWeekOffset(w => w - 1)}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center text-xs font-semibold text-slate-700">
              Jun {baseDate} – Jun {Math.min(baseDate + 6, 30)}, 2025
            </span>
            <button type="button" onClick={() => setWeekOffset(w => w + 1)}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <FilterPill label="All Meal Plans"  />
          <FilterPill label="All Locations"   />
          <FilterPill label="All Meal Types"  />

          <button type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>

        {/* Calendar grid */}
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse">
            {/* Day headers */}
            <thead>
              <tr>
                <th className="w-24 border-b border-r border-slate-100 bg-slate-50 px-3 py-3 text-left" />
                {weekDays.map(({ label, date }) => (
                  <th key={label}
                    className="border-b border-r border-slate-100 bg-slate-50 px-2 py-3 text-center last:border-r-0"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                    <p className={`mt-0.5 text-lg font-bold leading-none ${date === 26 ? "text-indigo-600" : "text-slate-800"}`}>
                      {date}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Meal slot rows */}
            <tbody className="divide-y divide-slate-100">
              {MEAL_SLOTS.map((slot) => {
                const style = SLOT_STYLE[slot];
                return (
                  <tr key={slot}>
                    {/* Row label */}
                    <td className="border-r border-slate-100 bg-slate-50/60 px-3 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                        <span className={`text-xs font-semibold ${style.text}`}>{slot}</span>
                      </div>
                    </td>

                    {/* Meal cells */}
                    {weekDays.map(({ label }) => {
                      const meal = GRID[label as DayLabel]?.[slot];
                      return (
                        <td key={label}
                          className="border-r border-slate-100 p-2 align-top last:border-r-0"
                          style={{ minWidth: 136 }}
                        >
                          {meal ? <MealCard meal={meal} /> : <EmptyCell />}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4">
          {(Object.entries(STATUS_STYLE) as [MealStatus, string][])
            .filter(([s]) => s !== "empty")
            .map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
                  {STATUS_LABEL[status]}
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Right sidebar ─────────────────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col gap-4">

        {/* Plan Overview donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-slate-900">Plan Overview</p>
          <p className="mb-3 text-[11px] text-slate-400">Week of Jun {baseDate}, 2025</p>

          <div className="relative flex justify-center">
            <div className="h-36 w-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PLAN_OVERVIEW} cx="50%" cy="50%" innerRadius={44} outerRadius={64}
                    dataKey="value" paddingAngle={2}
                  >
                    {PLAN_OVERVIEW.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-slate-900">{TOTAL_PLANS}</p>
                <p className="text-[10px] text-slate-400">Plans</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {PLAN_OVERVIEW.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-500">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-900">{d.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-xs font-medium text-slate-700">Total Active Plans</span>
              <span className="text-xs font-bold text-slate-900">{TOTAL_PLANS}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-900">Quick Actions</p>
          <div className="flex flex-col gap-0.5">
            {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
              <button key={label} type="button"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Highlights */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-900">Upcoming Highlights</p>
          <div className="flex flex-col gap-3">
            {UPCOMING.map(({ title, date, Icon, iconCls }) => (
              <div key={title} className="flex items-start gap-2.5">
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconCls}`} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-700">{title}</p>
                  <p className="text-[10px] text-slate-400">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}

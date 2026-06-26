"use client";

import { useState, useMemo } from "react";
import {
  LayoutList, Star, Users, CheckCircle2, Plus, Download,
  Edit2, Trash2, Settings, Clock, Zap, Award, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";
import {
  StatCard, Button, Badge, StatusBadge,
  Card, CardHeader, CardBody,
  DataTable, type Column,
  SearchBox, Pagination,
  SlideUp, FadeIn, StaggerContainer, StaggerItem,
} from "@/components/ui";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface MealPlan {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  mealsPerDay: number;
  type:        "All Meals" | "Breakfast Only" | "Lunch & Dinner";
  price:       number;
  calories:    number;
  protein:     number;
  carbs:       number;
  fat:         number;
  subscribers: number;
  rating:      number;
  categories:  string[];
  status:      "Active" | "Inactive" | "Draft";
  dietType:    "General" | "Vegan" | "Keto" | "Vegetarian" | "High Protein" | "Low Carb";
}

/* ── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_PLANS: MealPlan[] = [
  { id:"1",  name:"Balanced Plan",        emoji:"🥗", description:"Nutritionist-approved balanced nutrition",    mealsPerDay:3, type:"All Meals",      price:12.00, calories:1850, protein:85,  carbs:220, fat:62,  subscribers:2840, rating:4.8, categories:["General Health","Weight Loss"],   status:"Active",   dietType:"General"      },
  { id:"2",  name:"High Protein Plan",    emoji:"🥩", description:"Optimised for muscle building & recovery",   mealsPerDay:4, type:"All Meals",      price:14.99, calories:2400, protein:180, carbs:160, fat:80,  subscribers:1920, rating:4.9, categories:["Muscle Building","Athletic"],     status:"Active",   dietType:"High Protein" },
  { id:"3",  name:"Low Carb Plan",        emoji:"🥑", description:"Keto-friendly low-carb diet",                mealsPerDay:3, type:"All Meals",      price:12.49, calories:1600, protein:95,  carbs:80,  fat:90,  subscribers:1560, rating:4.7, categories:["Keto","Weight Loss"],            status:"Active",   dietType:"Low Carb"     },
  { id:"4",  name:"Vegetarian Plan",      emoji:"🥦", description:"100% plant-based wholesome meals",           mealsPerDay:3, type:"All Meals",      price:11.99, calories:1750, protein:75,  carbs:200, fat:58,  subscribers:890,  rating:4.6, categories:["Vegetarian","General Health"],   status:"Active",   dietType:"Vegetarian"   },
  { id:"5",  name:"Keto Flex Plan",       emoji:"🥚", description:"Strict keto with flexible meal windows",     mealsPerDay:2, type:"Lunch & Dinner", price:15.99, calories:1400, protein:100, carbs:40,  fat:110, subscribers:740,  rating:4.5, categories:["Keto","Weight Loss"],            status:"Active",   dietType:"Keto"         },
  { id:"6",  name:"Vegan Power Plan",     emoji:"🌱", description:"High-energy fully plant-based diet",         mealsPerDay:3, type:"All Meals",      price:13.49, calories:1900, protein:80,  carbs:240, fat:65,  subscribers:620,  rating:4.4, categories:["Vegan","Athletic"],              status:"Active",   dietType:"Vegan"        },
  { id:"7",  name:"Mediterranean Plan",   emoji:"🫒", description:"Heart-healthy Mediterranean-style meals",    mealsPerDay:3, type:"All Meals",      price:13.99, calories:2000, protein:90,  carbs:210, fat:72,  subscribers:580,  rating:4.7, categories:["General Health","Heart Health"],  status:"Active",   dietType:"General"      },
  { id:"8",  name:"Breakfast Boost",      emoji:"🍳", description:"Energising breakfast-focused nutrition",     mealsPerDay:1, type:"Breakfast Only", price:7.99,  calories:650,  protein:35,  carbs:80,  fat:24,  subscribers:420,  rating:4.3, categories:["General Health"],                status:"Active",   dietType:"General"      },
  { id:"9",  name:"Athlete Pro Plan",     emoji:"💪", description:"Professional athlete performance fuel",      mealsPerDay:5, type:"All Meals",      price:19.99, calories:3200, protein:220, carbs:320, fat:95,  subscribers:310,  rating:4.8, categories:["Athletic","Muscle Building"],    status:"Active",   dietType:"High Protein" },
  { id:"10", name:"Detox Cleanse Plan",   emoji:"🍵", description:"7-day gentle detox and gut reset",           mealsPerDay:3, type:"All Meals",      price:13.00, calories:1200, protein:60,  carbs:140, fat:45,  subscribers:280,  rating:4.2, categories:["Detox","General Health"],        status:"Inactive", dietType:"General"      },
  { id:"11", name:"Senior Wellness Plan", emoji:"🫐", description:"Nutrition optimised for healthy ageing",    mealsPerDay:3, type:"All Meals",      price:12.99, calories:1650, protein:78,  carbs:190, fat:55,  subscribers:195,  rating:4.5, categories:["General Health","Weight Loss"],   status:"Active",   dietType:"General"      },
  { id:"12", name:"Weight Loss Premium",  emoji:"🔥", description:"Calorie-controlled accelerated fat loss",    mealsPerDay:4, type:"All Meals",      price:16.49, calories:1350, protein:110, carbs:100, fat:48,  subscribers:160,  rating:4.6, categories:["Weight Loss"],                   status:"Draft",    dietType:"Low Carb"     },
];

const PLAN_CATEGORIES = [
  { name:"General Health",  count:15 },
  { name:"Weight Loss",     count:12 },
  { name:"Vegetarian",      count:9  },
  { name:"Muscle Building", count:8  },
  { name:"Low Carb",        count:7  },
  { name:"Keto",            count:6  },
  { name:"Athletic",        count:5  },
  { name:"Detox",           count:3  },
];

const MEAL_TYPES  = ["All Meals", "Breakfast Only", "Lunch & Dinner"] as const;
const DIET_TYPES  = ["General", "Vegan", "Keto", "Vegetarian", "High Protein", "Low Carb"] as const;
const PAGE_SIZE   = 8;

const TYPE_VARIANT: Record<string, "info" | "warning" | "success"> = {
  "All Meals":      "info",
  "Breakfast Only": "warning",
  "Lunch & Dinner": "success",
};

const COMPARISON_ROWS: { label: string; render: (p: MealPlan) => string }[] = [
  { label:"Meals / Day",    render: p => `${p.mealsPerDay} meals`                     },
  { label:"Calories / Day", render: p => `${p.calories.toLocaleString()} kcal`        },
  { label:"Protein / Day",  render: p => `${p.protein}g`                              },
  { label:"Carbs / Day",    render: p => `${p.carbs}g`                                },
  { label:"Fat / Day",      render: p => `${p.fat}g`                                  },
  { label:"Price / Day",    render: p => `$${p.price.toFixed(2)}`                     },
  { label:"Diet Type",      render: p => p.dietType                                   },
];

const FEATURED = MOCK_PLANS.slice(0, 4);

const PLAN_HIGHLIGHTS: Record<string, string> = {
  "1": "Most Popular",
  "2": "Bestseller",
  "4": "Best Value",
};

const PLAN_GRADIENT: Record<string, string> = {
  "1": "from-emerald-50 to-teal-50   border-emerald-200",
  "2": "from-indigo-50  to-violet-50 border-indigo-200",
  "3": "from-amber-50   to-orange-50 border-amber-200",
  "4": "from-green-50   to-lime-50   border-green-200",
};

const PLAN_FEATURES: Record<string, string[]> = {
  "1": ["3 balanced meals per day", "1,850 kcal daily target", "Nutritionist-approved menus", "Free home delivery"],
  "2": ["4 high-protein meals per day", "180g protein daily", "Gym-focused nutrition", "Post-workout snack included"],
  "3": ["3 low-carb meals per day", "Keto-friendly ingredients", "Weight management focused", "No refined sugars"],
  "4": ["3 plant-based meals per day", "Eco-friendly packaging", "High in iron & B12", "Locally sourced produce"],
};

const FEATURE_HIGHLIGHTS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Star,         title:"Find Your Plan",        desc:"Nutritionist-approved plans"      },
  { icon: Clock,        title:"Flexible & Convenient", desc:"Skip, pause, or swap anytime"     },
  { icon: Settings,     title:"Customizable",          desc:"Tailor meals to your preferences" },
  { icon: Zap,          title:"No-time Delivery",      desc:"Fresh delivered to your door"     },
  { icon: Award,        title:"Best Value",            desc:"Plans from just $11.99 / day"     },
];

/* ── Column builder ──────────────────────────────────────────────────────── */
function buildColumns(isOwner: boolean): Column<MealPlan>[] {
  const cols: Column<MealPlan>[] = [
    {
      key: "name", header: "Plan",
      render: p => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">{p.emoji}</div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{p.name}</p>
            <p className="truncate text-xs text-slate-400">{p.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "mealsPerDay", header: "Meals / Day",
      render: p => <span className="text-slate-600">{p.mealsPerDay} meals</span>,
    },
    {
      key: "type", header: "Type",
      render: p => <Badge variant={TYPE_VARIANT[p.type] ?? "muted"} size="xs">{p.type}</Badge>,
    },
    {
      key: "calories", header: "Calories",
      render: p => <span className="text-slate-600">{p.calories.toLocaleString()} kcal</span>,
    },
    {
      key: "price", header: "Price / Day",
      render: p => <span className="font-semibold text-slate-800">${p.price.toFixed(2)}</span>,
    },
    {
      key: "subscribers", header: "Subscribers",
      render: p => <span className="text-slate-600">{p.subscribers.toLocaleString()}</span>,
    },
    {
      key: "rating", header: "Rating",
      render: p => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-800">{p.rating.toFixed(1)}</span>
        </div>
      ),
    },
  ];

  if (isOwner) {
    cols.push({
      key: "categories", header: "Categories",
      render: p => (
        <div className="flex flex-wrap gap-1">
          {p.categories.slice(0, 2).map(c => <Badge key={c} variant="muted" size="xs">{c}</Badge>)}
          {p.categories.length > 2 && <Badge variant="muted" size="xs">+{p.categories.length - 2}</Badge>}
        </div>
      ),
    });
  }

  cols.push(
    { key: "status", header: "Status", render: p => <StatusBadge status={p.status.toLowerCase()} dot /> },
    {
      key: "actions", header: "", align: "right" as const,
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="xs" icon={Edit2}>Edit</Button>
          <Button variant="danger"    size="xs" icon={Trash2}>Delete</Button>
        </div>
      ),
    },
  );

  return cols;
}

/* ── Shared sidebar pieces ───────────────────────────────────────────────── */
function QuickActions({ isOwner }: { isOwner: boolean }) {
  return (
    <Card>
      <CardHeader title="Quick Actions" />
      <CardBody>
        <div className="flex flex-col gap-2">
          <Button fullWidth icon={Plus} size="sm">Add New Plan</Button>
          <Button variant="secondary" fullWidth icon={Settings} size="sm">Manage Categories</Button>
          {isOwner && <Button variant="secondary" fullWidth icon={Settings} size="sm">Plan Settings</Button>}
        </div>
      </CardBody>
    </Card>
  );
}

function PlanPerformance({ plans }: { plans: MealPlan[] }) {
  const top = [...plans]
    .filter(p => p.status === "Active")
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 5);
  return (
    <Card>
      <CardHeader title="Plan Performance" />
      <CardBody>
        <div className="flex flex-col gap-3">
          {top.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-bold text-slate-400">#{i + 1}</span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">{p.emoji}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800">{p.name}</p>
                <p className="text-[11px] text-slate-400">{p.subscribers.toLocaleString()} subscribers</p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-slate-700">{p.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function PlanCategories() {
  return (
    <Card>
      <CardHeader title="Plan Categories" action={<Button variant="secondary" size="xs">View all</Button>} />
      <CardBody>
        <div className="flex flex-col gap-1.5">
          {PLAN_CATEGORIES.map(cat => (
            <div key={cat.name} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors">
              <span className="text-sm text-slate-700">{cat.name}</span>
              <Badge variant="muted" size="xs">{cat.count}</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ── Owner / Admin table view ────────────────────────────────────────────── */
function OwnerAdminView({ isOwner }: { isOwner: boolean }) {
  const [search,   setSearch]   = useState("");
  const [mealType, setMealType] = useState("");
  const [dietType, setDietType] = useState("");
  const [status,   setStatus]   = useState("");
  const [page,     setPage]     = useState(1);

  const filtered = useMemo(() => MOCK_PLANS.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!mealType || p.type === mealType)      &&
      (!dietType || p.dietType === dietType)  &&
      (!status   || p.status === status)
    );
  }), [search, mealType, dietType, status]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columns   = useMemo(() => buildColumns(isOwner), [isOwner]);

  const activeCount      = MOCK_PLANS.filter(p => p.status === "Active").length;
  const totalSubscribers = MOCK_PLANS.reduce((s, p) => s + p.subscribers, 0);
  const avgRating        = (MOCK_PLANS.reduce((s, p) => s + p.rating, 0) / MOCK_PLANS.length).toFixed(1);

  const totalPlans  = isOwner ? 36 : MOCK_PLANS.length;
  const activePlans = isOwner ? 29 : activeCount;
  const subs        = isOwner ? 12846 : totalSubscribers;

  function resetFilters() {
    setSearch(""); setMealType(""); setDietType(""); setStatus(""); setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <SlideUp>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Meal Plans</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isOwner
                ? "Create, manage and oversee all meal plans across this organisation."
                : "Manage and oversee all meal plans available in this organisation."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" icon={Download} size="sm">Export Plans</Button>
            <Button icon={Plus}>Add New Plan</Button>
          </div>
        </div>
      </SlideUp>

      {/* Stats */}
      <StaggerContainer stagger={0.09} delayChildren={0.05} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StaggerItem><StatCard icon={LayoutList}   label="Total Plans"       value={totalPlans}    color="indigo"  /></StaggerItem>
        <StaggerItem><StatCard icon={CheckCircle2} label="Active Plans"      value={activePlans}   color="emerald" /></StaggerItem>
        <StaggerItem><StatCard icon={Users}        label="Total Subscribers" value={subs}          color="violet"  /></StaggerItem>
        <StaggerItem><StatCard icon={Star}         label="Avg. Rating"       value={`${avgRating} ⭐`} color="amber" /></StaggerItem>
      </StaggerContainer>

      {/* 2-col layout */}
      <div className="flex gap-5">
        {/* Left: filters + table */}
        <div className="min-w-0 flex-1 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox
              value={search}
              onChange={v => { setSearch(v); setPage(1); }}
              placeholder="Search meal plans…"
              size="sm"
              className="w-52"
            />
            <select
              value={mealType}
              onChange={e => { setMealType(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Meal Types</option>
              {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select
              value={dietType}
              onChange={e => { setDietType(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Diet Types</option>
              {DIET_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Draft</option>
            </select>
            {(search || mealType || dietType || status) && (
              <Button variant="secondary" size="sm" onClick={resetFilters}>Clear filters</Button>
            )}
          </div>

          <Card>
            <CardHeader
              title="All Plans"
              description={`Showing ${Math.min(filtered.length, PAGE_SIZE * page)} of ${filtered.length} results`}
            />
            <DataTable<MealPlan>
              columns={columns}
              data={paginated}
              rowKey={p => p.id}
              footer={
                <Pagination
                  page={page}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              }
            />
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:flex xl:w-56 shrink-0 flex-col gap-4">
          <QuickActions isOwner={isOwner} />
          {isOwner && <PlanCategories />}
          <PlanPerformance plans={MOCK_PLANS} />
        </div>
      </div>
    </div>
  );
}

/* ── Member browsing view ────────────────────────────────────────────────── */
function MemberView() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Meal Plans</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose, manage and customise the meal plan that fits your goals and lifestyle.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
              <Icon className="h-5 w-5 text-indigo-600" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold text-slate-800">{title}</p>
            <p className="text-[11px] leading-snug text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Plan cards + help sidebar */}
      <div className="flex gap-5">
        <div className="min-w-0 flex-1 flex flex-col gap-6">
          {/* Plan cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURED.map(plan => {
              const highlight = PLAN_HIGHLIGHTS[plan.id];
              const features  = PLAN_FEATURES[plan.id] ?? [];
              const gradient  = PLAN_GRADIENT[plan.id]  ?? "from-slate-50 to-white border-slate-200";
              const active    = selected === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-gradient-to-br ${gradient} p-5 transition-shadow hover:shadow-md ${active ? "ring-2 ring-indigo-600 shadow-md" : ""}`}
                >
                  {highlight && (
                    <span className="absolute -top-2.5 left-4">
                      <Badge variant={highlight === "Best Value" ? "success" : "info"} size="xs">{highlight}</Badge>
                    </span>
                  )}

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    {plan.emoji}
                  </div>

                  <h3 className="mt-3 font-semibold text-slate-800">{plan.name}</h3>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">${plan.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400">/ day</span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-700">{plan.rating}</span>
                    <span className="text-[11px] text-slate-400">({plan.subscribers.toLocaleString()})</span>
                  </div>

                  <ul className="mt-3 flex flex-col gap-1.5">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-4"
                    fullWidth
                    variant={active ? "success" : "primary"}
                    size="sm"
                    onClick={() => setSelected(active ? null : plan.id)}
                  >
                    {active ? "✓ Plan Selected" : "Select Plan"}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Plan comparison table */}
          <Card>
            <CardHeader title="Plan Comparison" description="Compare all featured plans side by side" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Feature</th>
                    {FEATURED.map(p => (
                      <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                        {p.emoji} {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {COMPARISON_ROWS.map(row => (
                    <tr key={row.label} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 text-xs font-medium text-slate-600">{row.label}</td>
                      {FEATURED.map(p => (
                        <td key={p.id} className="px-4 py-3 text-center text-xs text-slate-700">
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Help sidebar */}
        <div className="hidden xl:flex xl:w-64 shrink-0 flex-col gap-4">
          <Card>
            <CardBody>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                  🧑‍⚕️
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Need Help Choosing?</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Our nutritionists can help find the perfect plan for your goals.
                  </p>
                </div>
                <Button fullWidth icon={Award} size="sm">Try Our Plan Quiz</Button>
                <Button variant="secondary" fullWidth size="sm">Chat with a Nutritionist</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Browse by Goal" />
            <CardBody>
              <div className="flex flex-col">
                {PLAN_CATEGORIES.slice(0, 6).map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    className="flex items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="text-sm text-slate-700">{cat.name}</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Badge variant="muted" size="xs">{cat.count}</Badge>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Page entry ──────────────────────────────────────────────────────────── */
export default function MealPlansPage() {
  const { currentUser } = usePreviewUser();
  if (currentUser.role === "member") return <MemberView />;
  return <OwnerAdminView isOwner={currentUser.role === "owner"} />;
}

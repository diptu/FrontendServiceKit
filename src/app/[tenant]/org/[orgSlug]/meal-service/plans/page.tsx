"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  LayoutList, Star, Users, CheckCircle2, Plus, Download,
  Edit2, Trash2, Settings, Clock, Zap, Award, ChevronRight,
  SlidersHorizontal, ArrowUpDown, X, Eye, Tag, Utensils,
  type LucideIcon,
} from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";
import {
  StatCard, Button, Badge, StatusBadge,
  Card, CardHeader, CardBody,
  DataTable, type Column,
  SearchBox, Pagination,
  Modal,
  SlideUp, FadeIn, StaggerContainer, StaggerItem,
  ParallaxContainer,
} from "@/components/ui";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface MenuItem {
  id:          string;
  name:        string;
  mealTime:    "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories:    number;
  description: string;
}

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
  menus?:      MenuItem[];
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

const MOCK_MENUS: Record<string, MenuItem[]> = {
  "1": [
    { id:"m1-1", name:"Oatmeal with Blueberries",     mealTime:"Breakfast", calories:320, description:"Steel-cut oats with fresh blueberries & honey" },
    { id:"m1-2", name:"Grilled Chicken Salad",        mealTime:"Lunch",     calories:450, description:"Mixed greens, cherry tomatoes, balsamic dressing" },
    { id:"m1-3", name:"Baked Salmon & Vegetables",    mealTime:"Dinner",    calories:580, description:"Atlantic salmon fillet with seasonal roasted veg" },
  ],
  "2": [
    { id:"m2-1", name:"Protein Smoothie Bowl",        mealTime:"Breakfast", calories:380, description:"Whey protein, banana, almond milk, peanut butter" },
    { id:"m2-2", name:"Chicken Breast & Brown Rice",  mealTime:"Lunch",     calories:620, description:"Grilled chicken with brown rice & steamed broccoli" },
    { id:"m2-3", name:"Sirloin Steak & Sweet Potato", mealTime:"Dinner",    calories:780, description:"Lean sirloin with sweet potato mash & asparagus" },
    { id:"m2-4", name:"Greek Yoghurt & Almonds",      mealTime:"Snack",     calories:220, description:"High-protein recovery snack with healthy fats" },
  ],
  "9": [
    { id:"m9-1", name:"Pre-workout Oats",             mealTime:"Breakfast", calories:450, description:"Oatmeal with banana, honey & chia seeds" },
    { id:"m9-2", name:"Grilled Chicken & Quinoa",     mealTime:"Lunch",     calories:550, description:"Seasoned chicken breast with tri-colour quinoa & spinach" },
    { id:"m9-3", name:"Tuna & Brown Rice",            mealTime:"Lunch",     calories:480, description:"Post-workout recovery meal with omega-3 boost" },
    { id:"m9-4", name:"Lean Beef & Roasted Veg",      mealTime:"Dinner",    calories:720, description:"Ground beef with bell peppers, zucchini & tomatoes" },
    { id:"m9-5", name:"Whey Protein Bar",             mealTime:"Snack",     calories:240, description:"Post-training recovery snack with 25 g protein" },
  ],
};

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
function buildColumns(
  isOwner: boolean,
  onView:   (p: MealPlan) => void,
  onMenus:  (p: MealPlan) => void,
  onEdit:   (p: MealPlan) => void,
  onDelete: (p: MealPlan) => void,
): Column<MealPlan>[] {
  const cols: Column<MealPlan>[] = [
    {
      key: "name", header: "Plan",
      render: p => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">{p.emoji}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
            <p className="truncate text-xs text-slate-400">{p.mealsPerDay} meals · {p.calories.toLocaleString()} kcal</p>
          </div>
        </div>
      ),
    },
    {
      key: "type", header: "Type",
      render: p => <Badge variant={TYPE_VARIANT[p.type] ?? "muted"} size="xs">{p.type}</Badge>,
    },
    {
      key: "price", header: "Price / Day",
      render: p => <span className="font-semibold text-slate-800">${p.price.toFixed(2)}</span>,
    },
    {
      key: "rating", header: "Rating",
      render: p => (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-slate-800">{p.rating.toFixed(1)}</span>
          <span className="text-[11px] text-slate-400">({p.subscribers.toLocaleString()})</span>
        </div>
      ),
    },
    {
      key: "dietType", header: "Diet",
      render: p => <Badge variant="muted" size="xs">{p.dietType}</Badge>,
    },
  ];

  if (isOwner) {
    cols.push({
      key: "categories", header: "Categories",
      render: p => (
        <div className="flex flex-wrap gap-1">
          {p.categories.slice(0, 1).map(c => <Badge key={c} variant="muted" size="xs">{c}</Badge>)}
          {p.categories.length > 1 && <Badge variant="muted" size="xs">+{p.categories.length - 1}</Badge>}
        </div>
      ),
    });
  }

  cols.push(
    { key: "status", header: "Status", render: p => <StatusBadge status={p.status.toLowerCase()} dot /> },
    {
      key: "actions", header: "", align: "right" as const,
      render: p => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost"     size="xs" icon={Eye}      onClick={() => onView(p)}>View</Button>
          <Button variant="ghost"     size="xs" icon={Utensils} onClick={() => onMenus(p)} title="Manage menu items">Menu</Button>
          <Button variant="secondary" size="xs" icon={Edit2}    onClick={() => onEdit(p)}>Edit</Button>
          <Button variant="danger"    size="xs" icon={Trash2}   onClick={() => onDelete(p)}>Delete</Button>
        </div>
      ),
    },
  );

  return cols;
}

/* ── Shared sidebar pieces ───────────────────────────────────────────────── */
function QuickActions({
  isOwner, onAdd, onCategories, onSettings,
}: {
  isOwner: boolean;
  onAdd: () => void;
  onCategories: () => void;
  onSettings: () => void;
}) {
  return (
    <Card>
      <CardHeader title="Quick Actions" />
      <CardBody>
        <div className="flex flex-col gap-2">
          <Button fullWidth icon={Plus} size="sm" onClick={onAdd}>Add New Plan</Button>
          <Button variant="secondary" fullWidth icon={Tag} size="sm" onClick={onCategories}>Manage Categories</Button>
          {isOwner && <Button variant="secondary" fullWidth icon={Settings} size="sm" onClick={onSettings}>Plan Settings</Button>}
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

function PlanCategories({ categories, onManage }: { categories: { name: string; count: number }[]; onManage: () => void }) {
  return (
    <Card>
      <CardHeader title="Plan Categories" action={<Button variant="secondary" size="xs" onClick={onManage}>Manage</Button>} />
      <CardBody>
        <div className="flex flex-col gap-1.5">
          {categories.map(cat => (
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

/* ── Sort / filter helpers ───────────────────────────────────────────────── */
type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "rating-desc" | "subs-desc" | "cals-asc" | "cals-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc",   label: "Name A → Z"        },
  { value: "name-desc",  label: "Name Z → A"        },
  { value: "price-asc",  label: "Price: Low → High"  },
  { value: "price-desc", label: "Price: High → Low"  },
  { value: "rating-desc",label: "Rating: Highest"    },
  { value: "subs-desc",  label: "Most Popular"       },
  { value: "cals-asc",   label: "Calories: Fewest"   },
  { value: "cals-desc",  label: "Calories: Most"     },
];

const MIN_RATINGS = [
  { value: "",    label: "Any rating"  },
  { value: "4.0", label: "4.0 ★ & up" },
  { value: "4.5", label: "4.5 ★ & up" },
  { value: "4.8", label: "4.8 ★ & up" },
];

function sortList(plans: MealPlan[], key: SortKey): MealPlan[] {
  return [...plans].sort((a, b) => {
    switch (key) {
      case "name-asc":   return a.name.localeCompare(b.name);
      case "name-desc":  return b.name.localeCompare(a.name);
      case "price-asc":  return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating-desc":return b.rating - a.rating;
      case "subs-desc":  return b.subscribers - a.subscribers;
      case "cals-asc":   return a.calories - b.calories;
      case "cals-desc":  return b.calories - a.calories;
    }
  });
}

/* ── Edit plan modal ─────────────────────────────────────────────────────── */
function EditPlanModal({
  plan, onClose, onSave, availableCategories,
}: {
  plan: MealPlan;
  onClose: () => void;
  onSave: (updated: MealPlan) => void;
  availableCategories: { name: string; count: number }[];
}) {
  const [form, setForm] = useState<MealPlan>({ ...plan });

  const ctrl = "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  function field(key: keyof MealPlan, label: string, type: "text" | "number" | "select", opts?: string[]) {
    const value = String(form[key]);
    return (
      <div className="flex flex-col gap-0.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
        {type === "select" ? (
          <select
            value={value}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className={ctrl}
          >
            {opts!.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
            className={ctrl}
          />
        )}
      </div>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit — ${plan.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={CheckCircle2} onClick={() => { onSave(form); onClose(); }}>Save Changes</Button>
        </>
      }
    >
      <div className="max-h-[58vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("name", "Plan Name", "text")}</div>
          <div className="sm:col-span-2">{field("description", "Description", "text")}</div>

          {/* Numeric fields — 3-up on sm screens */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-3">
            {field("price",       "Price / Day ($)", "number")}
            {field("mealsPerDay", "Meals / Day",      "number")}
            {field("calories",    "Calories",         "number")}
          </div>
          <div className="sm:col-span-2 grid grid-cols-3 gap-3">
            {field("protein", "Protein (g)", "number")}
            {field("carbs",   "Carbs (g)",   "number")}
            {field("fat",     "Fat (g)",     "number")}
          </div>

          {field("type",     "Meal Type", "select", [...MEAL_TYPES])}
          {field("dietType", "Diet Type", "select", [...DIET_TYPES])}
          <div className="sm:col-span-2">{field("status", "Status", "select", ["Active", "Inactive", "Draft"])}</div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map(cat => {
                const on = form.categories.includes(cat.name);
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      categories: on
                        ? f.categories.filter(c => c !== cat.name)
                        : [...f.categories, cat.name],
                    }))}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      on
                        ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
            {form.categories.length === 0 && (
              <p className="text-[11px] text-slate-400">No categories selected — click to assign.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Delete confirmation ──────────────────────────────────────────────────── */
function DeletePlanModal({ plan, onClose, onConfirm }: { plan: MealPlan; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Delete Meal Plan"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={() => { onConfirm(); onClose(); }}>Delete Plan</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete <strong>{plan.name}</strong>?
        This will remove it from all active subscriptions and cannot be undone.
      </p>
    </Modal>
  );
}

/* ── View plan modal ─────────────────────────────────────────────────────── */
function ViewPlanModal({
  plan, onClose, onEdit,
}: { plan: MealPlan; onClose: () => void; onEdit: (p: MealPlan) => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Plan Details"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon={Edit2} onClick={() => { onClose(); onEdit(plan); }}>Edit Plan</Button>
        </>
      }
    >
      {/* Identity */}
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
          {plan.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">{plan.name}</h2>
            <StatusBadge status={plan.status.toLowerCase()} dot />
            <Badge variant="muted" size="xs">{plan.dietType}</Badge>
            <Badge variant={TYPE_VARIANT[plan.type] ?? "muted"} size="xs">{plan.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-slate-800">{plan.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({plan.subscribers.toLocaleString()} subscribers)</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {([
          { label: "Price / Day",   value: `$${plan.price.toFixed(2)}`           },
          { label: "Meals / Day",   value: `${plan.mealsPerDay} meals`           },
          { label: "Calories",      value: `${plan.calories.toLocaleString()} kcal` },
          { label: "Subscribers",   value: plan.subscribers.toLocaleString()     },
          { label: "Protein",       value: `${plan.protein}g`                    },
          { label: "Carbs",         value: `${plan.carbs}g`                      },
          { label: "Fat",           value: `${plan.fat}g`                        },
          { label: "Rating",        value: `${plan.rating.toFixed(1)} / 5.0`     },
        ] as const).map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Macros bar */}
      {(() => {
        const total = plan.protein + plan.carbs + plan.fat || 1;
        return (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Macro split</p>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full">
              <div className="bg-indigo-500 transition-all" style={{ width: `${(plan.protein / total) * 100}%` }} title={`Protein ${plan.protein}g`} />
              <div className="bg-amber-400 transition-all"  style={{ width: `${(plan.carbs   / total) * 100}%` }} title={`Carbs ${plan.carbs}g`} />
              <div className="bg-rose-400 transition-all"   style={{ width: `${(plan.fat     / total) * 100}%` }} title={`Fat ${plan.fat}g`} />
            </div>
            <div className="mt-1.5 flex gap-4 text-[11px] text-slate-500">
              <span><span className="inline-block mr-1 h-2 w-2 rounded-full bg-indigo-500" />Protein {plan.protein}g</span>
              <span><span className="inline-block mr-1 h-2 w-2 rounded-full bg-amber-400" />Carbs {plan.carbs}g</span>
              <span><span className="inline-block mr-1 h-2 w-2 rounded-full bg-rose-400" />Fat {plan.fat}g</span>
            </div>
          </div>
        );
      })()}

      {/* Categories */}
      {plan.categories.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {plan.categories.map(c => <Badge key={c} variant="muted" size="xs">{c}</Badge>)}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── Add plan modal ──────────────────────────────────────────────────────── */
const EMPTY_PLAN: Omit<MealPlan, "id"> = {
  name: "", emoji: "🍽️", description: "",
  mealsPerDay: 3, type: "All Meals", price: 12.00,
  calories: 1800, protein: 85, carbs: 200, fat: 60,
  subscribers: 0, rating: 0, categories: ["General Health"], menus: [],
  status: "Draft", dietType: "General",
};

function AddPlanModal({ onClose, onAdd, availableCategories }: {
  onClose: () => void;
  onAdd: (p: MealPlan) => void;
  availableCategories: { name: string; count: number }[];
}) {
  const [form, setForm] = useState<Omit<MealPlan, "id">>({ ...EMPTY_PLAN });
  const [error, setError] = useState("");

  const ctrl = "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  function field(key: keyof Omit<MealPlan, "id">, label: string, type: "text" | "number" | "select", opts?: string[]) {
    const value = String(form[key]);
    return (
      <div className="flex flex-col gap-0.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
        {type === "select" ? (
          <select value={value} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={ctrl}>
            {opts!.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={value}
            onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
            className={ctrl}
          />
        )}
      </div>
    );
  }

  function handleCreate() {
    if (!form.name.trim()) { setError("Plan name is required."); return; }
    onAdd({ ...form, id: Date.now().toString() });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add New Plan"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={Plus} onClick={handleCreate}>Create Plan</Button>
        </>
      }
    >
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
      <div className="max-h-[58vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("name",        "Plan Name *",  "text")}</div>
          <div className="sm:col-span-2">{field("description", "Description",  "text")}</div>

          {/* Emoji + selects row */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-3">
            {field("emoji",    "Emoji",      "text")}
            {field("type",     "Meal Type",  "select", [...MEAL_TYPES])}
            {field("dietType", "Diet Type",  "select", [...DIET_TYPES])}
          </div>

          {/* Numeric fields — 3-up */}
          <div className="sm:col-span-2 grid grid-cols-3 gap-3">
            {field("price",       "Price / Day ($)", "number")}
            {field("mealsPerDay", "Meals / Day",      "number")}
            {field("calories",    "Calories",         "number")}
          </div>
          <div className="sm:col-span-2 grid grid-cols-3 gap-3">
            {field("protein", "Protein (g)", "number")}
            {field("carbs",   "Carbs (g)",   "number")}
            {field("fat",     "Fat (g)",     "number")}
          </div>

          <div className="sm:col-span-2">{field("status", "Status", "select", ["Draft", "Active", "Inactive"])}</div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map(cat => {
                const on = form.categories.includes(cat.name);
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      categories: on
                        ? f.categories.filter(c => c !== cat.name)
                        : [...f.categories, cat.name],
                    }))}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      on
                        ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
            {form.categories.length === 0 && (
              <p className="text-[11px] text-slate-400">No categories selected — click to assign.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Manage categories modal ─────────────────────────────────────────────── */
function ManageCategoriesModal({
  categories, plans, onClose, onUpdate,
}: {
  categories: { name: string; count: number }[];
  plans: MealPlan[];
  onClose: () => void;
  onUpdate: (cats: { name: string; count: number }[]) => void;
}) {
  const [cats,    setCats]    = useState(categories);
  const [newName, setNewName] = useState("");

  const realCounts = useMemo(
    () => Object.fromEntries(cats.map(c => [c.name, plans.filter(p => p.categories.includes(c.name)).length])),
    [cats, plans],
  );

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed || cats.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    setCats(prev => [...prev, { name: trimmed, count: 0 }]);
    setNewName("");
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Manage Categories"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={CheckCircle2} onClick={() => { onUpdate(cats); onClose(); }}>Save Changes</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {cats.map(cat => (
            <div key={cat.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="muted" size="xs">{realCounts[cat.name] ?? cat.count} plans</Badge>
                <button type="button" onClick={() => setCats(prev => prev.filter(c => c.name !== cat.name))}
                  className="text-slate-300 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {cats.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No categories yet.</p>}
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            placeholder="New category name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button icon={Plus} size="sm" onClick={handleAdd}>Add</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Plan settings modal ─────────────────────────────────────────────────── */
interface PlanSettings {
  defaultMealType:    string;
  defaultDietType:    string;
  maxPlansPerMember:  number;
  allowPausing:       boolean;
  enableNotifications:boolean;
  autoActivate:       boolean;
}

const DEFAULT_PLAN_SETTINGS: PlanSettings = {
  defaultMealType: "All Meals", defaultDietType: "General",
  maxPlansPerMember: 3, allowPausing: true,
  enableNotifications: true, autoActivate: false,
};

function PlanSettingsModal({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<PlanSettings>({ ...DEFAULT_PLAN_SETTINGS });

  const toggles: { key: keyof PlanSettings; label: string }[] = [
    { key: "allowPausing",        label: "Allow members to pause plans"    },
    { key: "enableNotifications", label: "Enable plan notifications"        },
    { key: "autoActivate",        label: "Auto-activate new plans on save"  },
  ];

  const sel = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <Modal
      open
      onClose={onClose}
      title="Plan Settings"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={CheckCircle2} onClick={onClose}>Save Settings</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Defaults for new plans</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Meal Type</label>
              <select value={s.defaultMealType} onChange={e => setS(v => ({ ...v, defaultMealType: e.target.value }))} className={sel}>
                {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Diet Type</label>
              <select value={s.defaultDietType} onChange={e => setS(v => ({ ...v, defaultDietType: e.target.value }))} className={sel}>
                {DIET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Limits</p>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Max plans per member</label>
            <input type="number" min={1} max={10} value={s.maxPlansPerMember}
              onChange={e => setS(v => ({ ...v, maxPlansPerMember: Number(e.target.value) }))}
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Behaviour</p>
          <div className="flex flex-col gap-3">
            {toggles.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={s[key] as boolean}
                  onClick={() => setS(v => ({ ...v, [key]: !v[key] }))}
                  className={`relative h-5 w-9 rounded-full transition-colors ${s[key] ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${s[key] ? "translate-x-4" : ""}`} />
                </button>
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Manage plan menus modal ─────────────────────────────────────────────── */
const MEAL_TIME_COLORS: Record<MenuItem["mealTime"], string> = {
  Breakfast: "border-amber-200   bg-amber-50   text-amber-700",
  Lunch:     "border-emerald-200 bg-emerald-50 text-emerald-700",
  Dinner:    "border-indigo-200  bg-indigo-50  text-indigo-700",
  Snack:     "border-violet-200  bg-violet-50  text-violet-700",
};

const BLANK_MENU_FORM = { name: "", mealTime: "Lunch" as MenuItem["mealTime"], calories: 0, description: "" };

function ManagePlanMenusModal({
  plan, onClose, onSave,
}: {
  plan:    MealPlan;
  onClose: () => void;
  onSave:  (updated: MealPlan) => void;
}) {
  const [menus,       setMenus]       = useState<MenuItem[]>(plan.menus ?? []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm,     setAddForm]     = useState(BLANK_MENU_FORM);
  const [addError,    setAddError]    = useState("");
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editForm,    setEditForm]    = useState(BLANK_MENU_FORM);

  function handleAdd() {
    if (!addForm.name.trim()) { setAddError("Name is required."); return; }
    setMenus(prev => [...prev, { id: `mi-${Date.now()}`, ...addForm }]);
    setAddForm(BLANK_MENU_FORM);
    setAddError("");
    setShowAddForm(false);
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({ name: item.name, mealTime: item.mealTime, calories: item.calories, description: item.description });
  }

  function saveEdit() {
    if (!editForm.name.trim()) return;
    setMenus(prev => prev.map(m => m.id === editingId ? { ...m, ...editForm } : m));
    setEditingId(null);
  }

  function handleRemove(id: string) {
    setMenus(prev => prev.filter(m => m.id !== id));
    if (editingId === id) setEditingId(null);
  }

  const grouped = {
    Breakfast: menus.filter(m => m.mealTime === "Breakfast"),
    Lunch:     menus.filter(m => m.mealTime === "Lunch"),
    Dinner:    menus.filter(m => m.mealTime === "Dinner"),
    Snack:     menus.filter(m => m.mealTime === "Snack"),
  };
  const ctrl = "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <Modal
      open
      onClose={onClose}
      title={`Menu — ${plan.emoji} ${plan.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={CheckCircle2} onClick={() => { onSave({ ...plan, menus }); onClose(); }}>Save Menu</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

        {/* ── Toolbar: item count + add toggle ── */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {menus.length} item{menus.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => { setShowAddForm(v => !v); setAddError(""); }}
            title="Add menu item"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showAddForm
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </button>
        </div>

        {/* ── Inline add form — slides in when toggled ── */}
        <AnimatePresence initial={false}>
          {showAddForm && (
            <motion.div
              key="add-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                {addError && <p className="mb-2 text-xs font-medium text-red-500">{addError}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Item name (e.g. Chicken Grilled) *"
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                    className={`col-span-2 w-full ${ctrl}`}
                  />
                  <select
                    value={addForm.mealTime}
                    onChange={e => setAddForm(f => ({ ...f, mealTime: e.target.value as MenuItem["mealTime"] }))}
                    className={ctrl}
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    placeholder="Calories (optional)"
                    value={addForm.calories || ""}
                    onChange={e => setAddForm(f => ({ ...f, calories: Number(e.target.value) }))}
                    className={ctrl}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    className={`col-span-2 w-full ${ctrl}`}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setAddError(""); setAddForm(BLANK_MENU_FORM); }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grouped items ── */}
        <div className="max-h-[52vh] overflow-y-auto flex flex-col gap-4 pr-0.5">
          {menus.length === 0 && !showAddForm && (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
              <Utensils className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-400">No menu items yet</p>
              <p className="text-xs text-slate-300">Click &ldquo;Add item&rdquo; above to get started</p>
            </div>
          )}

          {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map(time => {
            const items = grouped[time];
            if (!items.length) return null;
            return (
              <div key={time}>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-2 ${MEAL_TIME_COLORS[time]}`}>
                  {time}
                </span>
                <div className="flex flex-col gap-1.5">
                  {items.map(item => {
                    const isEditing = editingId === item.id;
                    return isEditing ? (
                      /* ── Inline edit row ── */
                      <div key={item.id} className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                            className={`col-span-2 w-full ${ctrl}`}
                          />
                          <select
                            value={editForm.mealTime}
                            onChange={e => setEditForm(f => ({ ...f, mealTime: e.target.value as MenuItem["mealTime"] }))}
                            className={ctrl}
                          >
                            <option>Breakfast</option>
                            <option>Lunch</option>
                            <option>Dinner</option>
                            <option>Snack</option>
                          </select>
                          <input
                            type="number"
                            min={0}
                            value={editForm.calories || ""}
                            onChange={e => setEditForm(f => ({ ...f, calories: Number(e.target.value) }))}
                            placeholder="Calories"
                            className={ctrl}
                          />
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Description (optional)"
                            className={`col-span-2 w-full ${ctrl}`}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 transition-colors"
                            title="Save"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Display row ── */
                      <div key={item.id} className="group flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          {item.description && <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>}
                        </div>
                        {item.calories > 0 && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            {item.calories} kcal
                          </span>
                        )}
                        {/* Action icons — visible on row hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            title="Edit"
                            className="rounded p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            title="Remove"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

/* ── Faceted-filter helper ───────────────────────────────────────────────── */
interface FilterState {
  search: string; mealType: string; dietType: string; status: string;
  minPrice: string; maxPrice: string; minRating: string;
}
type FilterKey = keyof FilterState;

function applyFilters(plans: MealPlan[], f: FilterState, skip?: FilterKey): MealPlan[] {
  const q    = skip === "search"    ? "" : f.search.toLowerCase();
  const minP = f.minPrice  ? Number(f.minPrice)  : null;
  const maxP = f.maxPrice  ? Number(f.maxPrice)  : null;
  const minR = skip === "minRating" ? null : (f.minRating ? Number(f.minRating) : null);
  return plans.filter(p =>
    (!q           || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
    (skip === "mealType" || !f.mealType || p.type     === f.mealType) &&
    (skip === "dietType" || !f.dietType || p.dietType === f.dietType) &&
    (skip === "status"   || !f.status   || p.status   === f.status)   &&
    (minR === null || p.rating >= minR) &&
    (minP === null || p.price  >= minP) &&
    (maxP === null || p.price  <= maxP),
  );
}

/* ── Elastic animated table ─────────────────────────────────────────────── */
/*
 * Replaces DataTable for the plans list to enable:
 *   1. Fluid Elastic Reordering — motion.tr layout (FLIP) animates each row's
 *      y-delta when sort order changes, driven by spring physics.
 *   2. Interruptible Search Transitions — AnimatePresence mode="popLayout"
 *      makes exiting rows position:absolute immediately so remaining rows
 *      start their layout animation without waiting, and any mid-animation
 *      filter change cancels pending animations natively.
 */
const TALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;

function MotionPlansTable({
  columns, data, rowKey, footer,
}: {
  columns: Column<MealPlan>[];
  data:    MealPlan[];
  rowKey:  (row: MealPlan) => string;
  footer?: ReactNode;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={[
                    "px-5 py-3.5 text-xs font-semibold text-slate-500",
                    TALIGN[col.align ?? "left"],
                    col.headerClassName ?? "",
                  ].join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* LayoutGroup keeps motion.tr layout IDs scoped to this table */}
          <LayoutGroup>
            <motion.tbody layout className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout" initial={false}>
                {data.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <td colSpan={columns.length}>
                      <div className="flex flex-col items-center gap-1.5 py-12 text-center">
                        <LayoutList className="h-8 w-8 text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No plans match these filters</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  data.map((row, idx) => (
                    <motion.tr
                      key={rowKey(row)}
                      layout                           /* FLIP: capture rect → animate delta */
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1,  y: 0   }}
                      exit={{ opacity: 0,    y: 8, scale: 0.98 }}
                      transition={{
                        layout: { type: "spring", stiffness: 340, damping: 28, mass: 0.9 },
                        opacity: { duration: 0.18 },
                        y:       { type: "spring", stiffness: 340, damping: 28 },
                      }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {columns.map(col => (
                        <td
                          key={col.key}
                          className={[
                            "px-5 py-3.5 text-slate-700",
                            TALIGN[col.align ?? "left"],
                            col.className ?? "",
                          ].join(" ")}
                        >
                          {col.render
                            ? col.render(row, idx)
                            : String((row as unknown as Record<string, unknown>)[col.key] ?? "—")
                          }
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </LayoutGroup>
        </table>
      </div>

      {footer && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          {footer}
        </div>
      )}
    </>
  );
}

/* ── Owner / Admin table view ────────────────────────────────────────────── */
function OwnerAdminView({ isOwner }: { isOwner: boolean }) {
  const [plans,          setPlans]          = useState<MealPlan[]>(() =>
    MOCK_PLANS.map(p => ({ ...p, menus: MOCK_MENUS[p.id] ?? [] }))
  );
  const [categories,     setCategories]     = useState(PLAN_CATEGORIES);
  const [search,         setSearch]         = useState("");
  const [mealType,       setMealType]       = useState("");
  const [dietType,       setDietType]       = useState("");
  const [status,         setStatus]         = useState("");
  const [sortKey,        setSortKey]        = useState<SortKey>("name-asc");
  const [minPrice,       setMinPrice]       = useState("");
  const [maxPrice,       setMaxPrice]       = useState("");
  const [minRating,      setMinRating]      = useState("");
  const [showMore,       setShowMore]       = useState(false);
  const [page,           setPage]           = useState(1);
  const [viewing,        setViewing]        = useState<MealPlan | null>(null);
  const [editing,        setEditing]        = useState<MealPlan | null>(null);
  const [deleting,       setDeleting]       = useState<MealPlan | null>(null);
  const [showAdd,        setShowAdd]        = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [menuPlan,       setMenuPlan]       = useState<MealPlan | null>(null);

  const extraFilterCount = [minPrice, maxPrice, minRating].filter(Boolean).length;

  /* Faceted counts — for each filter dimension, count matches given ALL OTHER active filters */
  const fs: FilterState = { search, mealType, dietType, status, minPrice, maxPrice, minRating };

  const mealTypeCounts = useMemo(() => {
    const base = applyFilters(plans, fs, "mealType");
    return Object.fromEntries(MEAL_TYPES.map(t => [t, base.filter(p => p.type === t).length]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, search, dietType, status, minPrice, maxPrice, minRating]);

  const dietTypeCounts = useMemo(() => {
    const base = applyFilters(plans, fs, "dietType");
    return Object.fromEntries(DIET_TYPES.map(t => [t, base.filter(p => p.dietType === t).length]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, search, mealType, status, minPrice, maxPrice, minRating]);

  const statusCounts = useMemo(() => {
    const base = applyFilters(plans, fs, "status");
    return { Active: base.filter(p => p.status === "Active").length, Inactive: base.filter(p => p.status === "Inactive").length, Draft: base.filter(p => p.status === "Draft").length };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, search, mealType, dietType, minPrice, maxPrice, minRating]);

  const ratingCounts = useMemo(() => {
    const base = applyFilters(plans, fs, "minRating");
    return Object.fromEntries(MIN_RATINGS.filter(r => r.value).map(r => [r.value, base.filter(p => p.rating >= Number(r.value)).length]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, search, mealType, dietType, status, minPrice, maxPrice]);

  /* Auto-clear a filter whose currently selected value has become invalid */
  useEffect(() => { if (mealType  && (mealTypeCounts[mealType]   ?? 0) === 0) { setMealType("");  setPage(1); } }, [mealType,  mealTypeCounts]);
  useEffect(() => { if (dietType  && (dietTypeCounts[dietType]   ?? 0) === 0) { setDietType("");  setPage(1); } }, [dietType,  dietTypeCounts]);
  useEffect(() => { if (status    && (statusCounts[status as keyof typeof statusCounts] ?? 0) === 0) { setStatus(""); setPage(1); } }, [status, statusCounts]);
  useEffect(() => { if (minRating && (ratingCounts[minRating]    ?? 0) === 0) { setMinRating(""); setPage(1); } }, [minRating, ratingCounts]);

  const filtered = useMemo(() => {
    const q    = search.toLowerCase();
    const minP = minPrice  ? Number(minPrice)  : null;
    const maxP = maxPrice  ? Number(maxPrice)  : null;
    const minR = minRating ? Number(minRating) : null;

    const base = plans.filter(p =>
      (!q        || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!mealType || p.type    === mealType)  &&
      (!dietType || p.dietType === dietType) &&
      (!status   || p.status   === status)   &&
      (minP === null || p.price  >= minP)    &&
      (maxP === null || p.price  <= maxP)    &&
      (minR === null || p.rating >= minR),
    );
    return sortList(base, sortKey);
  }, [plans, search, mealType, dietType, status, sortKey, minPrice, maxPrice, minRating]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columns   = useMemo(
    () => buildColumns(isOwner, setViewing, setMenuPlan, setEditing, setDeleting),
    [isOwner],
  );

  const activeCount      = plans.filter(p => p.status === "Active").length;
  const totalSubscribers = plans.reduce((s, p) => s + p.subscribers, 0);
  const avgRating        = (plans.reduce((s, p) => s + p.rating, 0) / plans.length).toFixed(1);

  const totalPlans  = isOwner ? 36 : plans.length;
  const activePlans = isOwner ? 29 : activeCount;
  const subs        = isOwner ? 12846 : totalSubscribers;

  const hasAnyFilter = !!(search || mealType || dietType || status || minPrice || maxPrice || minRating);

  function resetFilters() {
    setSearch(""); setMealType(""); setDietType(""); setStatus("");
    setMinPrice(""); setMaxPrice(""); setMinRating("");
    setSortKey("name-asc"); setPage(1);
  }

  function handleSave(updated: MealPlan) {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function handleDelete(id: string) {
    setPlans(prev => prev.filter(p => p.id !== id));
    setPage(1);
  }

  const selectCls = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const inputCls  = "w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="flex flex-col gap-6">
      {/* Modals */}
      {viewing && (
        <ViewPlanModal
          plan={viewing}
          onClose={() => setViewing(null)}
          onEdit={p => { setViewing(null); setEditing(p); }}
        />
      )}
      {menuPlan && (
        <ManagePlanMenusModal
          plan={menuPlan}
          onClose={() => setMenuPlan(null)}
          onSave={handleSave}
        />
      )}
      {showAdd && (
        <AddPlanModal
          onClose={() => setShowAdd(false)}
          onAdd={p => setPlans(prev => [...prev, p])}
          availableCategories={categories}
        />
      )}
      {showCategories && (
        <ManageCategoriesModal
          categories={categories}
          plans={plans}
          onClose={() => setShowCategories(false)}
          onUpdate={setCategories}
        />
      )}
      {showSettings && <PlanSettingsModal onClose={() => setShowSettings(false)} />}
      {editing && (
        <EditPlanModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          availableCategories={categories}
        />
      )}
      {deleting && (
        <DeletePlanModal
          plan={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting.id)}
        />
      )}

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
            <Button icon={Plus} onClick={() => setShowAdd(true)}>Add New Plan</Button>
          </div>
        </div>
      </SlideUp>

      {/* Stats — ParallaxContainer gives a subtle scroll-drift as page scrolls */}
      <ParallaxContainer speed={0.06} className="py-1 -my-1">
        <StaggerContainer stagger={0.09} delayChildren={0.05} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StaggerItem><StatCard icon={LayoutList}   label="Total Plans"       value={totalPlans}  countUp              color="indigo"  /></StaggerItem>
          <StaggerItem><StatCard icon={CheckCircle2} label="Active Plans"      value={activePlans} countUp              color="emerald" /></StaggerItem>
          <StaggerItem><StatCard icon={Users}        label="Total Subscribers" value={subs}        countUp              color="violet"  /></StaggerItem>
          <StaggerItem><StatCard icon={Star}         label="Avg. Rating"       value={`${avgRating} ⭐`}               color="amber"   /></StaggerItem>
        </StaggerContainer>
      </ParallaxContainer>

      {/* 2-col layout */}
      <div className="flex gap-5">
        {/* Left: filter bar + table */}
        <div className="min-w-0 flex-1 flex flex-col gap-4">

          {/* ── Filter / Sort bar ── */}
          <Card noPadding>
            {/* Primary row */}
            <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100">
              <SearchBox
                value={search}
                onChange={v => { setSearch(v); setPage(1); }}
                placeholder="Search plans…"
                size="sm"
                className="w-48 shrink-0"
              />

              <select value={mealType} onChange={e => { setMealType(e.target.value); setPage(1); }} className={selectCls}>
                <option value="">All Meal Types</option>
                {MEAL_TYPES.map(t => {
                  const n = mealTypeCounts[t] ?? 0;
                  return <option key={t} value={t} disabled={n === 0}>{t} ({n})</option>;
                })}
              </select>

              <select value={dietType} onChange={e => { setDietType(e.target.value); setPage(1); }} className={selectCls}>
                <option value="">All Diet Types</option>
                {DIET_TYPES.map(t => {
                  const n = dietTypeCounts[t] ?? 0;
                  return <option key={t} value={t} disabled={n === 0}>{t} ({n})</option>;
                })}
              </select>

              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={selectCls}>
                <option value="">All Statuses</option>
                {(["Active", "Inactive", "Draft"] as const).map(s => {
                  const n = statusCounts[s] ?? 0;
                  return <option key={s} value={s} disabled={n === 0}>{s} ({n})</option>;
                })}
              </select>

              {/* Sort */}
              <div className="flex items-center gap-1.5 ml-auto">
                <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <select value={sortKey} onChange={e => { setSortKey(e.target.value as SortKey); setPage(1); }} className={selectCls}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* More filters toggle */}
              <button
                type="button"
                onClick={() => setShowMore(v => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  showMore || extraFilterCount > 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {extraFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {extraFilterCount}
                  </span>
                )}
              </button>

              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </button>
              )}
            </div>

            {/* Expanded extra-filter row — height-animated, interruptible */}
            <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                key="extra-filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
              <div className="flex flex-wrap items-end gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100">
                {/* Price range */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Price / Day ($)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={minPrice}
                      onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                      className={inputCls}
                    />
                    <span className="text-slate-400 text-sm">–</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={maxPrice}
                      onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Min rating */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Min Rating</span>
                  <select
                    value={minRating}
                    onChange={e => { setMinRating(e.target.value); setPage(1); }}
                    className={selectCls}
                  >
                    {MIN_RATINGS.map(r => {
                    if (!r.value) return <option key="" value="">{r.label}</option>;
                    const n = ratingCounts[r.value] ?? 0;
                    return <option key={r.value} value={r.value} disabled={n === 0}>{r.label} ({n})</option>;
                  })}
                  </select>
                </div>

                {/* Active filter chips */}
                {extraFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                    {minPrice && (
                      <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        Min ${minPrice}
                        <button onClick={() => { setMinPrice(""); setPage(1); }}><X className="h-3 w-3" /></button>
                      </span>
                    )}
                    {maxPrice && (
                      <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        Max ${maxPrice}
                        <button onClick={() => { setMaxPrice(""); setPage(1); }}><X className="h-3 w-3" /></button>
                      </span>
                    )}
                    {minRating && (
                      <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {minRating}★+
                        <button onClick={() => { setMinRating(""); setPage(1); }}><X className="h-3 w-3" /></button>
                      </span>
                    )}
                  </div>
                )}
              </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Table */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-800">All Plans</span>
                <span className="ml-2 text-xs text-slate-400">
                  {filtered.length === plans.length
                    ? `${filtered.length} plans`
                    : `${filtered.length} of ${plans.length} plans`}
                </span>
              </div>
              {hasAnyFilter && (
                <span className="text-xs text-indigo-600 font-medium">
                  Filters active
                </span>
              )}
            </div>

            <MotionPlansTable
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

        {/* Right sidebar — slides in after the main content */}
        <FadeIn delay={0.18} className="hidden xl:flex xl:w-56 shrink-0 flex-col gap-4">
          <QuickActions
            isOwner={isOwner}
            onAdd={() => setShowAdd(true)}
            onCategories={() => setShowCategories(true)}
            onSettings={() => setShowSettings(true)}
          />
          {isOwner && <PlanCategories categories={categories} onManage={() => setShowCategories(true)} />}
          <PlanPerformance plans={plans} />
        </FadeIn>
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
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Meal Plans</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose, manage and customise the meal plan that fits your goals and lifestyle.
        </p>
      </FadeIn>

      {/* Feature highlights */}
      <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
          <StaggerItem key={title}>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <Icon className="h-5 w-5 text-indigo-600" strokeWidth={1.8} />
              </div>
              <p className="text-xs font-semibold text-slate-800">{title}</p>
              <p className="text-[11px] leading-snug text-slate-400">{desc}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Plan cards + help sidebar */}
      <SlideUp delay={0.06} className="flex gap-5">
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
      </SlideUp>
    </div>
  );
}

/* ── Page entry ──────────────────────────────────────────────────────────── */
export default function MealPlansPage() {
  const { currentUser } = usePreviewUser();
  if (currentUser.role === "member") return <MemberView />;
  return <OwnerAdminView isOwner={currentUser.role === "owner"} />;
}

"use client";

import { useState } from "react";
import {
  Search, Download, Plus, Filter, ChevronDown,
  Edit2, Eye, ChevronLeft, ChevronRight, Leaf,
  Drumstick, BookOpen, Copy, Settings,
} from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui";

/* ── Types ───────────────────────────────────────────────────────────────── */

type RecipeStatus   = "published" | "draft" | "archived";
type MealCategory   = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Beverage" | "Salad";
type DietType       = "Vegetarian" | "Non-Veg" | "Vegan" | "Pescatarian";

interface Recipe {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  category: MealCategory;
  mealTime: string;
  type: DietType;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  tags: string[];
  status: RecipeStatus;
}

/* ── Mock data ───────────────────────────────────────────────────────────── */

const RECIPES: Recipe[] = [
  { id:"r01", name:"Grilled Chicken Salad",    desc:"Light & nutritious with mixed greens",     emoji:"🥗", category:"Lunch",     mealTime:"Afternoon", type:"Non-Veg",    cal:420, protein:38, carbs:22, fat:14, price:12.50, tags:["High Protein","Low Carb"],           status:"published" },
  { id:"r02", name:"Veggie Omelette Wrap",     desc:"Fluffy omelette with seasonal vegetables", emoji:"🌯", category:"Breakfast", mealTime:"Morning",   type:"Vegetarian", cal:310, protein:18, carbs:34, fat:11, price:9.00,  tags:["Gluten Free","Low Fat"],             status:"published" },
  { id:"r03", name:"Quinoa Power Bowl",        desc:"Protein-packed plant-based meal",          emoji:"🍚", category:"Lunch",     mealTime:"Afternoon", type:"Vegan",      cal:480, protein:22, carbs:56, fat:16, price:13.00, tags:["Vegan","High Fibre"],                status:"published" },
  { id:"r04", name:"Grilled Salmon Plate",     desc:"Omega-rich salmon with steamed greens",    emoji:"🍣", category:"Dinner",    mealTime:"Evening",   type:"Pescatarian",cal:620, protein:52, carbs:18, fat:28, price:18.50, tags:["Keto","High Protein","Gluten Free"], status:"published" },
  { id:"r05", name:"Avocado Toast",            desc:"Sourdough with smashed avocado & poached egg", emoji:"🥑", category:"Breakfast", mealTime:"Morning",type:"Vegetarian", cal:340, protein:14, carbs:38, fat:16, price:8.50,  tags:["Low Carb","Gluten Free"],            status:"published" },
  { id:"r06", name:"Beef Stir Fry",            desc:"Tender beef strips with wok vegetables",   emoji:"🥩", category:"Dinner",    mealTime:"Evening",   type:"Non-Veg",    cal:540, protein:44, carbs:28, fat:22, price:16.00, tags:["High Protein","Dairy Free"],         status:"published" },
  { id:"r07", name:"Lentil Soup",              desc:"Hearty red lentil with cumin & lemon",     emoji:"🍲", category:"Lunch",     mealTime:"Afternoon", type:"Vegan",      cal:290, protein:16, carbs:46, fat:5,  price:7.50,  tags:["Vegan","High Fibre","Low Fat"],      status:"published" },
  { id:"r08", name:"Overnight Oats",           desc:"Cold-prep oats with chia seeds & berries", emoji:"🥣", category:"Breakfast", mealTime:"Morning",   type:"Vegetarian", cal:380, protein:12, carbs:62, fat:10, price:6.50,  tags:["Low Fat","High Fibre"],              status:"published" },
  { id:"r09", name:"Chicken Tikka Masala",     desc:"Aromatic Indian-inspired chicken curry",   emoji:"🍛", category:"Dinner",    mealTime:"Evening",   type:"Non-Veg",    cal:580, protein:46, carbs:32, fat:24, price:15.00, tags:["High Protein","Gluten Free"],        status:"published" },
  { id:"r10", name:"Green Protein Smoothie",   desc:"Spinach, banana, protein powder blend",    emoji:"🥤", category:"Beverage",  mealTime:"Morning",   type:"Vegan",      cal:220, protein:24, carbs:28, fat:4,  price:6.00,  tags:["Vegan","Post-Workout"],              status:"draft"     },
  { id:"r11", name:"Caesar Salad",             desc:"Romaine lettuce, parmesan & croutons",     emoji:"🥬", category:"Salad",     mealTime:"Afternoon", type:"Vegetarian", cal:310, protein:12, carbs:24, fat:18, price:10.00, tags:["Low Carb","Gluten Free"],            status:"published" },
  { id:"r12", name:"Mushroom Risotto",         desc:"Creamy arborio rice with wild mushrooms",  emoji:"🍄", category:"Dinner",    mealTime:"Evening",   type:"Vegetarian", cal:510, protein:14, carbs:72, fat:16, price:14.50, tags:["Gluten Free","Vegetarian"],          status:"draft"     },
];

const STATS = [
  { label:"Total Recipes",     value:"226", sub:"All recipes",        accent:"bg-indigo-500",  light:"bg-indigo-50",  text:"text-indigo-700" },
  { label:"Published Recipes", value:"100", sub:"40.7% of total",     accent:"bg-emerald-500", light:"bg-emerald-50", text:"text-emerald-700" },
  { label:"Draft Recipes",     value:"3",   sub:"1.3% of total",      accent:"bg-amber-500",   light:"bg-amber-50",   text:"text-amber-700"  },
  { label:"Recipe Categories", value:"16",  sub:"64 sub-categories",  accent:"bg-violet-500",  light:"bg-violet-50",  text:"text-violet-700" },
  { label:"Avg. Calories",     value:"512", sub:"Kcal per serving",    accent:"bg-sky-500",     light:"bg-sky-50",     text:"text-sky-700"    },
];

const CATEGORY_COLORS: Record<MealCategory, { bg: string; text: string; dot: string }> = {
  Breakfast: { bg:"bg-emerald-100", text:"text-emerald-700", dot:"bg-emerald-500" },
  Lunch:     { bg:"bg-orange-100",  text:"text-orange-700",  dot:"bg-orange-500"  },
  Dinner:    { bg:"bg-violet-100",  text:"text-violet-700",  dot:"bg-violet-500"  },
  Snack:     { bg:"bg-sky-100",     text:"text-sky-700",     dot:"bg-sky-500"     },
  Beverage:  { bg:"bg-teal-100",    text:"text-teal-700",    dot:"bg-teal-500"    },
  Salad:     { bg:"bg-lime-100",    text:"text-lime-700",    dot:"bg-lime-500"    },
};

const TAG_COLORS: Record<string, string> = {
  "High Protein":      "bg-indigo-50 text-indigo-700",
  "Low Carb":          "bg-emerald-50 text-emerald-700",
  "Gluten Free":       "bg-amber-50 text-amber-700",
  "Vegan":             "bg-green-50 text-green-700",
  "Keto":              "bg-violet-50 text-violet-700",
  "High Fibre":        "bg-teal-50 text-teal-700",
  "Low Fat":           "bg-sky-50 text-sky-700",
  "Dairy Free":        "bg-rose-50 text-rose-700",
  "Post-Workout":      "bg-orange-50 text-orange-700",
  "Vegetarian":        "bg-lime-50 text-lime-700",
  "Diabetic Friendly": "bg-cyan-50 text-cyan-700",
};

const STATUS_STYLE: Record<RecipeStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft:     "bg-amber-50 text-amber-700 border-amber-200",
  archived:  "bg-slate-100 text-slate-500 border-slate-200",
};

const SIDEBAR_CATEGORIES: { name: MealCategory; count: number }[] = [
  { name:"Breakfast", count:45 },
  { name:"Lunch",     count:62 },
  { name:"Dinner",    count:58 },
  { name:"Snack",     count:30 },
  { name:"Beverage",  count:22 },
  { name:"Salad",     count:9  },
];

const POPULAR_INGREDIENTS = [
  "Chicken","Quinoa","Avocado","Spinach","Salmon",
  "Brown Rice","Lentils","Eggs","Tofu","Oats",
  "Sweet Potato","Chickpeas",
];

const PAGE_SIZE = 10;

/* ── Sub-components ──────────────────────────────────────────────────────── */

function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
    >
      {label}
      <ChevronDown className="h-3 w-3 text-slate-400" />
    </button>
  );
}

function DietBadge({ type }: { type: DietType }) {
  const isVeg = type !== "Non-Veg";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold
        ${isVeg ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
    >
      {isVeg ? (
        <Leaf className="h-2.5 w-2.5" />
      ) : (
        <Drumstick className="h-2.5 w-2.5" />
      )}
      {type}
    </span>
  );
}

function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  const pp = Math.round((protein / total) * 100);
  const cp = Math.round((carbs   / total) * 100);
  const fp = 100 - pp - cp;
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
        <div className="bg-indigo-500" style={{ width: `${pp}%` }} />
        <div className="bg-orange-400" style={{ width: `${cp}%` }} />
        <div className="bg-rose-400"   style={{ width: `${fp}%` }} />
      </div>
      <p className="text-[10px] text-slate-400">
        P{protein}g · C{carbs}g · F{fat}g
      </p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function MenusPage() {
  const [search,   setSearch]   = useState("");
  const [catFilter,setCatFilter]= useState<string>("All Categories");
  const [typeFilter,setTypeFilter]=useState<string>("All Types");
  const [statusFilter,setStatusFilter]=useState<string>("All Status");
  const [page,     setPage]     = useState(1);

  const filtered = RECIPES.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter    === "All Categories" || r.category === catFilter;
    const matchType   = typeFilter   === "All Types"      || r.type === typeFilter;
    const matchStatus = statusFilter === "All Status"     || r.status === statusFilter;
    return matchSearch && matchCat && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recipes</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage and organise all your recipes across the organisation
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Recipes
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add New Recipe
          </button>
        </div>
      </FadeIn>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {STATS.map((s) => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2.5 inline-flex rounded-lg p-2 ${s.light}`}>
                <div className={`h-1.5 w-8 rounded-full ${s.accent}`} />
              </div>
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* ── Body: table + sidebar ───────────────────────────────────────── */}
      <SlideUp className="flex gap-5">

        {/* ── Table column ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search recipes, orders, mentions..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <FilterPill label={catFilter    === "All Categories" ? "All Categories" : catFilter}    />
            <FilterPill label={typeFilter   === "All Types"      ? "All Types"      : typeFilter}   />
            <FilterPill label="All Publishers" />
            <FilterPill label={statusFilter === "All Status"     ? "Status"         : statusFilter} />
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Name","Category","Meal Time","Type","Calories","Nutrition","Price","Tags",""].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageRows.map((r) => {
                  const cat = CATEGORY_COLORS[r.category];
                  return (
                    <tr key={r.id} className="group transition-colors hover:bg-slate-50/60">

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl shadow-sm">
                            {r.emoji}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[160px]">{r.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400 truncate max-w-[160px]">{r.desc}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.bg} ${cat.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                          {r.category}
                        </span>
                      </td>

                      {/* Meal Time */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.mealTime}</td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <DietBadge type={r.type} />
                      </td>

                      {/* Calories */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-orange-600">{r.cal}</span>
                        <span className="text-slate-400"> kcal</span>
                      </td>

                      {/* Nutrition */}
                      <td className="px-4 py-3">
                        <MacroBar protein={r.protein} carbs={r.carbs} fat={r.fat} />
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                        ${r.price.toFixed(2)}
                      </td>

                      {/* Tags */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[tag] ?? "bg-slate-100 text-slate-600"}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                            title="View"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-700">{filtered.length}</span> recipes
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors ${
                    p === page
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <select className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 focus:outline-none">
                <option>10 / page</option>
                <option>25 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <aside className="flex w-56 shrink-0 flex-col gap-4">

          {/* Recipe Categories */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Recipe Categories</p>
            </div>
            <div className="divide-y divide-slate-50">
              {SIDEBAR_CATEGORIES.map(({ name, count }) => {
                const { dot, bg, text } = CATEGORY_COLORS[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => { setCatFilter(catFilter === name ? "All Categories" : name); setPage(1); }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-50
                      ${catFilter === name ? "bg-indigo-50/60" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                      <span className="text-xs font-medium text-slate-700">{name}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bg} ${text}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Ingredients */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-900">Popular Ingredients</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_INGREDIENTS.map((ing) => (
                <span
                  key={ing}
                  className="cursor-pointer rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-slate-900">Quick Actions</p>
            <div className="flex flex-col gap-0.5">
              {[
                { icon: Plus,     label: "Add New Recipe"    },
                { icon: BookOpen, label: "Browse Ingredients" },
                { icon: Copy,     label: "Bulk Update Status" },
                { icon: Settings, label: "Recipe Settings"    },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {label}
                </button>
              ))}
            </div>
          </div>

        </aside>
      </SlideUp>
    </div>
  );
}

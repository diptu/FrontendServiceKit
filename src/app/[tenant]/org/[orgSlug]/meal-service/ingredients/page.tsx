"use client";

import { useState } from "react";
import { Search, Download, Plus, Filter, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button, Badge } from "@/components/ui";

const STATS = [
  { label: "Total Categories",    value: "16",   sub: "All categories",      color: "bg-indigo-500"  },
  { label: "Total Ingredients",   value: "298",  sub: "All ingredients",     color: "bg-violet-500"  },
  { label: "Active Ingredients",  value: "156",  sub: "87% of total",        color: "bg-emerald-500" },
  { label: "Plant Based",         value: "84%",  sub: "Of all ingredients",  color: "bg-lime-500"    },
  { label: "Avg Buying Price",    value: "$4.28",sub: "Per unit",            color: "bg-amber-500"   },
];

const INGREDIENTS = [
  { name: "Chicken Breast",  category: "Proteins",       cal: 165, protein: "31g", carbs: "0g",  fat: "3.6g", unit: "100g", price: "$8.50",  status: "active",   emoji: "🍗", pref: "Halal"    },
  { name: "Brown Rice",      category: "Grains",         cal: 216, protein: "5g",  carbs: "45g", fat: "1.8g", unit: "100g", price: "$2.20",  status: "active",   emoji: "🍚", pref: "Vegan"     },
  { name: "Olive Oil",       category: "Fats & Oils",    cal: 884, protein: "0g",  carbs: "0g",  fat: "100g", unit: "100ml",price: "$12.00", status: "active",   emoji: "🫒", pref: "Vegan"     },
  { name: "Eggs",            category: "Proteins",       cal: 155, protein: "13g", carbs: "1g",  fat: "11g",  unit: "100g", price: "$4.50",  status: "active",   emoji: "🥚", pref: "Vegetarian"},
  { name: "Spinach",         category: "Vegetables",     cal: 23,  protein: "3g",  carbs: "4g",  fat: "0.4g", unit: "100g", price: "$3.80",  status: "active",   emoji: "🥬", pref: "Vegan"     },
  { name: "Quinoa",          category: "Grains",         cal: 368, protein: "14g", carbs: "64g", fat: "6g",   unit: "100g", price: "$6.00",  status: "active",   emoji: "🌾", pref: "Vegan"     },
  { name: "Avocado",         category: "Fruits",         cal: 160, protein: "2g",  carbs: "9g",  fat: "15g",  unit: "100g", price: "$5.50",  status: "low-stock",emoji: "🥑", pref: "Vegan"     },
  { name: "Greek Yogurt",    category: "Dairy",          cal: 59,  protein: "10g", carbs: "4g",  fat: "0.4g", unit: "100g", price: "$3.20",  status: "active",   emoji: "🥛", pref: "Vegetarian"},
];

const CATEGORIES = [
  { name: "Vegetables",      count: 32 }, { name: "Proteins",        count: 25 },
  { name: "Grains & Cereals",count: 20 }, { name: "Fats & Oils",     count: 18 },
  { name: "Dairy",           count: 16 }, { name: "Fruits",          count: 14 },
  { name: "Herbs & Spices",  count: 8  }, { name: "Others",          count: 5  },
];

const STOCK_ALERTS = [
  { name: "Chicken Breast", level: 12, unit: "kg",  severity: "critical" },
  { name: "Olive Oil",      level: 6,  unit: "L",   severity: "critical" },
  { name: "Avocado",        level: 18, unit: "kg",  severity: "warning"  },
];

const STATUS_STYLE: Record<string, string> = {
  active:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "low-stock":"bg-amber-50 text-amber-700 border-amber-200",
  inactive:   "bg-slate-100 text-slate-500 border-slate-200",
};

export default function IngredientsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ingredients</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage all ingredients used in recipes across the organisation.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Export</Button>
          <Button size="sm" icon={Plus}>Add Ingredient</Button>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STATS.map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <SlideUp className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Table */}
        <div className="xl:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ingredients..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {["All Categories", "All Types", "All Preference", "All Status"].map(l => (
              <select key={l} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"><option>{l}</option></select>
            ))}
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" />Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  {["Ingredient", "Category", "Cal", "Protein", "Carbs", "Fat", "Unit", "Price", "Status", ""].map(h => (
                    <th key={h} className="px-3 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {INGREDIENTS.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase())).map(i => (
                  <tr key={i.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">{i.emoji}</div>
                        <div>
                          <p className="font-medium text-slate-900">{i.name}</p>
                          <p className="text-slate-400">{i.pref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{i.category}</td>
                    <td className="px-3 py-3 text-orange-600 font-medium">{i.cal}</td>
                    <td className="px-3 py-3 text-indigo-600">{i.protein}</td>
                    <td className="px-3 py-3 text-amber-600">{i.carbs}</td>
                    <td className="px-3 py-3 text-rose-600">{i.fat}</td>
                    <td className="px-3 py-3 text-slate-500">{i.unit}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{i.price}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[i.status]}`}>
                        {i.status.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><Edit2 className="h-3 w-3" /></button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing {INGREDIENTS.length} of 298 ingredients</span>
            <div className="flex items-center gap-1">
              {[1,2,3].map(p => <button key={p} type="button" className={`h-6 w-6 rounded text-[11px] ${p === 1 ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Ingredient Categories</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {CATEGORIES.map(c => (
                <div key={c.name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-medium text-slate-700">{c.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Stock Alerts</h3>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="divide-y divide-slate-50">
              {STOCK_ALERTS.map(a => (
                <div key={a.name} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-slate-900">{a.name}</p>
                    <p className="text-[11px] text-slate-400">{a.level} {a.unit} remaining</p>
                  </div>
                  <Badge variant={a.severity === "critical" ? "error" : "warning"} size="xs">
                    {a.severity === "critical" ? "Critical" : "Low"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button fullWidth size="sm" icon={Plus}>Add New Ingredient</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Export Categories</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Export Ingredients</Button>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}

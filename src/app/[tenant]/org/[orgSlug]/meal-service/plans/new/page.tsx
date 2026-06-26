"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Upload, CheckCircle2, Circle, Save, ArrowRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const STEPS = ["Plan Information", "Meals & Nutrition", "Pricing & Target", "Access & Admin"];

const CHECKLIST = [
  { label: "Plan Information",       done: false },
  { label: "Add Nutrition Details",  done: false },
  { label: "Configure Pricing",      done: false },
  { label: "Set Target Audience",    done: false },
  { label: "Review & Publish",       done: false },
];

const MEAL_TYPES   = ["All Meals", "Breakfast", "Lunch", "Dinner", "Snack", "Vegan", "Keto"];
const CATEGORIES   = ["General Health", "Weight Loss", "Muscle Building", "Low Carb", "Vegetarian", "Keto", "Mediterranean"];
const CUISINES     = ["Mediterranean", "Asian", "American", "Italian", "Middle Eastern", "Indian", "Japanese"];
const ALLERGENS    = ["Gluten", "Dairy", "Nuts", "Soy", "Eggs", "Shellfish", "Fish"];
const BEVERAGES    = ["Water", "Fresh Juice", "Herbal Tea", "Green Tea", "Protein Shake"];
const SPICE_LEVELS = ["Mild", "Medium", "Hot", "Extra Hot"];

export default function NewMealPlanPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [step, setStep]               = useState(0);
  const [form, setForm]               = useState({
    name: "", category: "", shortDesc: "", mealType: "", detailedDesc: "",
    mealsPerDay: 3, calMin: 1200, calMax: 2400,
    selectedCuisines: [] as string[], allergens: [] as string[], spice: "Mild",
    beverages: [] as string[],
  });

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <FadeIn className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href={`/org/${orgSlug}/meal-service/plans`} className="hover:text-indigo-600 transition-colors">Meal Plans</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-600 font-medium">New Meal Plan</span>
      </FadeIn>

      <FadeIn>
        <h1 className="text-xl font-bold text-slate-900">Create New Meal Plan</h1>
        <p className="mt-0.5 text-sm text-slate-500">Meal Plans &rsaquo; New Meal Plan</p>
      </FadeIn>

      {/* Step tabs */}
      <FadeIn>
        <div className="flex gap-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors",
                step === i ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${step === i ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
          ))}
        </div>
      </FadeIn>

      <SlideUp className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Form — 2 cols */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Plan Information card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Plan Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Plan Name <span className="text-red-500">*</span></label>
                <input
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Balanced Plan"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Meal Type</label>
                <select value={form.mealType} onChange={e => setForm(f => ({ ...f, mealType: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select meal type</option>
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Short Description</label>
                <textarea
                  value={form.shortDesc} onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))}
                  placeholder="Briefly describe this meal plan..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Plan Image</label>
                <div className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <p className="text-xs text-slate-500">Drop an image here, or <span className="font-medium text-indigo-600">browse</span></p>
                  <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 2MB</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Detailed Description</label>
                <textarea
                  value={form.detailedDesc} onChange={e => setForm(f => ({ ...f, detailedDesc: e.target.value }))}
                  placeholder="Describe the plan in detail — its benefits, what it includes, and who it's for..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Plan Configuration */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Plan Configuration</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Meals per day */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Meals Per Day</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm(f => ({ ...f, mealsPerDay: Math.max(1, f.mealsPerDay - 1) }))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-lg">−</button>
                  <span className="w-8 text-center text-lg font-bold text-slate-900">{form.mealsPerDay}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, mealsPerDay: Math.min(6, f.mealsPerDay + 1) }))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-lg">+</button>
                  <span className="text-xs text-slate-400">Select meals per day</span>
                </div>
              </div>

              {/* Calorie range */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Calorie Range (kcal)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.calMin} onChange={e => setForm(f => ({ ...f, calMin: +e.target.value }))} className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <span className="text-slate-400 text-xs">to</span>
                  <input type="number" value={form.calMax} onChange={e => setForm(f => ({ ...f, calMax: +e.target.value }))} className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {/* Cuisine preferences */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-700">Cuisine Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm(f => ({ ...f, selectedCuisines: toggle(f.selectedCuisines, c) }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${form.selectedCuisines.includes(c) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-700">Select Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map(a => (
                    <button
                      key={a} type="button"
                      onClick={() => setForm(f => ({ ...f, allergens: toggle(f.allergens, a) }))}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${form.allergens.includes(a) ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >{a}</button>
                  ))}
                </div>
              </div>

              {/* Spice level */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Spice Level</label>
                <select value={form.spice} onChange={e => setForm(f => ({ ...f, spice: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {SPICE_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Beverages */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-700">Beverages</label>
                <div className="flex flex-wrap gap-2">
                  {BEVERAGES.map(b => (
                    <button
                      key={b} type="button"
                      onClick={() => setForm(f => ({ ...f, beverages: toggle(f.beverages, b) }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${form.beverages.includes(b) ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >{b}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="flex flex-col gap-4">
          {/* Plan summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Plan Summary</h3>
            <div className="flex min-h-[100px] flex-col items-center justify-center rounded-lg bg-slate-50 p-4 text-center">
              <div className="mb-2 text-3xl">📋</div>
              <p className="text-xs text-slate-400 leading-relaxed">Fill in the details on the left to see a preview of your meal plan here.</p>
            </div>
            {form.name && (
              <div className="mt-3 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-medium text-slate-800">{form.name}</span></div>
                {form.category && <div className="flex justify-between"><span className="text-slate-400">Category</span><span className="font-medium text-slate-800">{form.category}</span></div>}
                <div className="flex justify-between"><span className="text-slate-400">Meals/Day</span><span className="font-medium text-slate-800">{form.mealsPerDay}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Calories</span><span className="font-medium text-slate-800">{form.calMin}–{form.calMax} kcal</span></div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Plan Checklist</h3>
            <div className="flex flex-col gap-2.5">
              {CHECKLIST.map((item, i) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {i < step
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                  <span className={`text-xs ${i < step ? "text-emerald-700 line-through" : i === step ? "font-semibold text-slate-900" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button fullWidth variant="secondary" size="sm" icon={Save}>Save as Draft</Button>
              <Button
                fullWidth size="sm" icon={ArrowRight} iconPosition="right"
                onClick={() => setStep(s => Math.min(s + 1, STEPS.length - 1))}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}

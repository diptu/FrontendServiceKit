"use client";

import { useState, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Copy, Filter, Plus, Download, Upload, X,
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

const DAYS: { label: DayLabel }[] = [
  { label: "Mon" }, { label: "Tue" }, { label: "Wed" }, { label: "Thu" },
  { label: "Fri" }, { label: "Sat" }, { label: "Sun" },
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

/* ── CSV helpers ─────────────────────────────────────────────────────────── */

// Keyword → [emoji, estimated kcal] — used during import to auto-fill fields
// the user does not supply (Emoji, Calories). In production this would call an
// LLM endpoint; the pattern table provides instant, deterministic results.
const MEAL_META_PATTERNS: [RegExp, string, number][] = [
  [/overnight oat|oat|porridge/i,           "🥣", 370],
  [/smoothie bowl/i,                         "🫐", 360],
  [/avocado toast/i,                         "🥑", 340],
  [/pancake/i,                               "🥞", 440],
  [/french toast/i,                          "🍞", 420],
  [/omelette|omelet|veggie.*egg|egg.*veggi/i,"🍳", 320],
  [/high protein|protein meal/i,             "🥚", 480],
  [/grilled chicken salad/i,                 "🥗", 420],
  [/caesar salad/i,                          "🥬", 310],
  [/chicken tikka/i,                         "🍛", 560],
  [/chicken/i,                               "🍗", 430],
  [/salmon teriyaki/i,                       "🍣", 580],
  [/grilled salmon/i,                        "🐠", 590],
  [/salmon/i,                                "🐟", 530],
  [/poke bowl/i,                             "🐟", 490],
  [/fish/i,                                  "🐟", 430],
  [/beef stir.?fry|stir.?fry.*beef/i,        "🥩", 540],
  [/steak|beef/i,                            "🥩", 560],
  [/lamb chop|lamb/i,                        "🍖", 620],
  [/mushroom risotto/i,                      "🍄", 510],
  [/spaghetti bolognese|bolognese/i,         "🍝", 600],
  [/pasta|spaghetti/i,                       "🍝", 580],
  [/quinoa.*bowl|bowl.*quinoa/i,             "🍚", 460],
  [/quinoa/i,                                "🌾", 430],
  [/lentil soup|lentil/i,                    "🍲", 310],
  [/soup/i,                                  "🍲", 280],
  [/mediterranean/i,                         "🫙", 480],
  [/veggie burrito|burrito/i,                "🌯", 470],
  [/wrap|sandwich/i,                         "🌯", 450],
  [/pizza/i,                                 "🍕", 620],
  [/burger/i,                                "🍔", 580],
  [/hummus/i,                                "🥕", 160],
  [/fruit salad/i,                           "🍓", 140],
  [/yogurt parfait|parfait/i,                "🍨", 200],
  [/protein bar/i,                           "🍫", 210],
  [/mixed nut|trail.?mix/i,                  "🥜", 200],
  [/nut/i,                                   "🥜", 190],
  [/energy ball/i,                           "⚡",  170],
  [/green smoothie|smoothie/i,               "🥤", 160],
  [/orange juice|juice/i,                    "🍊", 110],
  [/cold brew|coffee|latte/i,                "🧋",  70],
  [/turmeric latte/i,                        "☕",  90],
  [/tea/i,                                   "🍵",  10],
  [/salad/i,                                 "🥗", 320],
  [/bowl/i,                                  "🥗", 450],
];

function detectMealMetadata(name: string): { emoji: string; cal: number } {
  for (const [pattern, emoji, cal] of MEAL_META_PATTERNS) {
    if (pattern.test(name)) return { emoji, cal };
  }
  return { emoji: "🍽️", cal: 400 };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

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

function MealCard({ meal, onRemove }: { meal: PlannerMeal; onRemove?: () => void }) {
  return (
    <div className="group relative flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md">
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-600"
          aria-label="Remove meal"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
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

function EmptyCell({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex h-full min-h-[80px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-400"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

const MONTHS       = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PLANNER_PLAN_OPTIONS = [
  "Balanced Plan", "High Protein", "Vegetarian Plan", "Keto Flex",
  "Vegan Power", "Med. Plan", "Athlete Pro", "Low Carb", "Detox Cleanse",
];

const PLAN_MEAL_DEFAULTS: Record<string, Record<MealSlot, string>> = {
  "Balanced Plan":    { Breakfast: "Overnight Oats",        Lunch: "Grilled Chicken Salad",  Dinner: "Salmon Teriyaki",        Snacks: "Fruit Salad",      Beverage: "Green Smoothie"      },
  "High Protein":     { Breakfast: "High Protein Meal",     Lunch: "Chicken Tikka Masala",   Dinner: "Beef Stir Fry",          Snacks: "Protein Bar",      Beverage: "Fresh Orange Juice"  },
  "Vegetarian Plan":  { Breakfast: "Avocado Toast",         Lunch: "Quinoa Veggie Bowl",     Dinner: "Mushroom Risotto",       Snacks: "Hummus & Veggies", Beverage: "Turmeric Latte"      },
  "Keto Flex":        { Breakfast: "Veggie Omelette",       Lunch: "Caesar Salad",           Dinner: "Grilled Salmon Plate",   Snacks: "Mixed Nuts",       Beverage: "Cold Brew Coffee"    },
  "Vegan Power":      { Breakfast: "Smoothie Bowl",         Lunch: "Lentil Soup",            Dinner: "Veggie Burrito",         Snacks: "Energy Balls",     Beverage: "Cold Brew Coffee"    },
  "Med. Plan":        { Breakfast: "Avocado Toast",         Lunch: "Mediterranean Bowl",     Dinner: "Grilled Salmon Plate",   Snacks: "Hummus & Veggies", Beverage: "Turmeric Latte"      },
  "Athlete Pro":      { Breakfast: "High Protein Meal",     Lunch: "Poke Bowl",              Dinner: "Lamb Chops",             Snacks: "Protein Bar",      Beverage: "Green Smoothie"      },
  "Low Carb":         { Breakfast: "Veggie Omelette",       Lunch: "Caesar Salad",           Dinner: "Beef Stir Fry",          Snacks: "Mixed Nuts",       Beverage: "Cold Brew Coffee"    },
  "Detox Cleanse":    { Breakfast: "Smoothie Bowl",         Lunch: "Lentil Soup",            Dinner: "Quinoa Veggie Bowl",     Snacks: "Fruit Salad",      Beverage: "Turmeric Latte"      },
};

const SELECT_CLS = "w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";
const INPUT_CLS  = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function WeeklyPlannerPage() {
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [grid,         setGrid]         = useState<Record<DayLabel, DayMeals>>(GRID);
  const [importState,  setImportState]  = useState<"idle" | "success" | "error">("idle");
  const [importMsg,    setImportMsg]    = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Add-meal modal state ─────────────────────────────────────────────── */
  const [modalOpen,   setModalOpen]   = useState(false);
  const [fromCell,    setFromCell]    = useState(true);   // false = via Create Plan button
  const [modalDay,    setModalDay]    = useState<DayLabel>("Mon");
  const [modalSlot,   setModalSlot]   = useState<MealSlot>("Breakfast");
  const [formName,    setFormName]    = useState("");
  const [formPlan,    setFormPlan]    = useState(PLANNER_PLAN_OPTIONS[0]);
  const [formStatus,  setFormStatus]  = useState<MealStatus>("booked");
  const [nameError,   setNameError]   = useState(false);

  function openFromCell(day: DayLabel, slot: MealSlot) {
    setFromCell(true); setModalDay(day); setModalSlot(slot);
    setFormName(""); setFormPlan(PLANNER_PLAN_OPTIONS[0]); setFormStatus("booked"); setNameError(false);
    setModalOpen(true);
  }

  function openCreate() {
    setFromCell(false); setModalDay("Mon"); setModalSlot("Breakfast");
    setFormName(""); setFormPlan(PLANNER_PLAN_OPTIONS[0]); setFormStatus("booked"); setNameError(false);
    setModalOpen(true);
  }

  function handleAddMeal() {
    if (!formName.trim()) { setNameError(true); return; }
    const { emoji, cal } = detectMealMetadata(formName.trim());
    setGrid(prev => ({
      ...prev,
      [modalDay]: { ...prev[modalDay], [modalSlot]: { name: formName.trim(), emoji, cal, status: formStatus, plan: formPlan } },
    }));
    setModalOpen(false);
  }

  function handleRemoveMeal(day: DayLabel, slot: MealSlot) {
    setGrid(prev => {
      const dayMeals = { ...prev[day] };
      delete dayMeals[slot];
      return { ...prev, [day]: dayMeals };
    });
  }

  const liveMeta = formName.trim() ? detectMealMetadata(formName.trim()) : null;

  // Compute the Monday of the current real-calendar week, then shift by weekOffset
  const todayReal = new Date();
  todayReal.setHours(0, 0, 0, 0);
  const dow        = todayReal.getDay(); // 0=Sun … 6=Sat
  const daysToMon  = dow === 0 ? -6 : 1 - dow;
  const thisMonday = new Date(todayReal);
  thisMonday.setDate(todayReal.getDate() + daysToMon);
  const weekStart = new Date(thisMonday);
  weekStart.setDate(thisMonday.getDate() + weekOffset * 7);

  const weekDays = DAYS.map(({ label }, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { label, date: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  });

  const wFirst    = weekDays[0];
  const wLast     = weekDays[6];
  const weekLabel = wFirst.month === wLast.month
    ? `${MONTHS_SHORT[wFirst.month]} ${wFirst.date} – ${wLast.date}, ${wLast.year}`
    : `${MONTHS_SHORT[wFirst.month]} ${wFirst.date} – ${MONTHS_SHORT[wLast.month]} ${wLast.date}, ${wLast.year}`;

  function isToday(d: { date: number; month: number; year: number }) {
    const t = new Date();
    return d.date === t.getDate() && d.month === t.getMonth() && d.year === t.getFullYear();
  }

  function downloadTemplate() {
    // Read per-day plan defaults saved in Settings → Meal Service → Weekly Default Plans
    const savedPlans: Record<string, string> = (() => {
      try {
        const raw = localStorage.getItem("meal-planner-day-defaults");
        return raw ? (JSON.parse(raw) as Record<string, string>) : {};
      } catch { return {}; }
    })();

    // Blank template — Meal Name and Status are always empty so the user fills them in.
    // Plan is the only pre-filled column, sourced exclusively from Settings defaults.
    // Emoji and Calories are auto-detected on import from the meal name.
    const header = ["Day", "Slot", "Meal Name", "Status", "Plan"];
    const rows: string[][] = [header];
    for (const { label } of DAYS) {
      const defaultPlan = savedPlans[label] ?? "";
      for (const slot of MEAL_SLOTS) {
        const mealName = PLAN_MEAL_DEFAULTS[defaultPlan]?.[slot] ?? "";
        rows.push([label, slot, mealName, "pending", defaultPlan]);
      }
    }
    const csv  = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "meal_planner_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const lines = (ev.target?.result as string).trim().split(/\r?\n/);
        const hdr   = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
        const col   = (name: string) => hdr.indexOf(name);
        const dayIdx  = col("day"), slotIdx = col("slot"), nameIdx = col("meal name");
        if (dayIdx === -1 || slotIdx === -1 || nameIdx === -1) {
          setImportState("error");
          setImportMsg("CSV must have Day, Slot, and Meal Name columns");
          return;
        }
        const newGrid: Record<DayLabel, DayMeals> = {
          Mon:{}, Tue:{}, Wed:{}, Thu:{}, Fri:{}, Sat:{}, Sun:{},
        };
        let count = 0;
        for (const line of lines.slice(1)) {
          if (!line.trim()) continue;
          const c    = parseCsvLine(line);
          const day  = c[dayIdx]?.trim()  as DayLabel;
          const slot = c[slotIdx]?.trim() as MealSlot;
          const name = c[nameIdx]?.trim();
          if (!name || !DAYS.find(d => d.label === day) || !MEAL_SLOTS.includes(slot)) continue;
          const rawStatus = c[col("status")]?.trim() ?? "";
          // Emoji and Calories are not in the template — auto-detect from meal name
          const { emoji, cal } = detectMealMetadata(name);
          newGrid[day][slot] = {
            name,
            emoji,
            cal,
            status: (["booked","confirmed","pending"].includes(rawStatus)
                      ? rawStatus : "pending") as MealStatus,
            plan:   c[col("plan")]?.trim() || "",
          };
          count++;
        }
        setGrid(newGrid);
        setImportState("success");
        setImportMsg(`${count} meal${count !== 1 ? "s" : ""} imported — emoji & calories auto-detected`);
        setTimeout(() => setImportState("idle"), 5000);
      } catch {
        setImportState("error");
        setImportMsg("Could not parse the CSV — check the file format");
      }
    };
    reader.readAsText(file);
  }

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
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Download Template
              </button>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm transition-colors hover:bg-indigo-100">
                <Upload className="h-4 w-4" />
                Import CSV
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Create Plan
              </button>
            </div>
            {importState !== "idle" && (
              <p className={`text-[11px] font-medium ${importState === "success" ? "text-emerald-600" : "text-red-500"}`}>
                {importState === "success" ? "✓" : "✕"} {importMsg}
              </p>
            )}
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
            <span className="min-w-[150px] text-center text-xs font-semibold text-slate-700">
              {weekLabel}
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
                {weekDays.map(day => (
                  <th key={day.label}
                    className="border-b border-r border-slate-100 bg-slate-50 px-2 py-3 text-center last:border-r-0"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{day.label}</p>
                    <p className={`mt-0.5 text-lg font-bold leading-none ${isToday(day) ? "text-indigo-600" : "text-slate-800"}`}>
                      {day.date}
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
                      const day  = label as DayLabel;
                      const meal = grid[day]?.[slot];
                      return (
                        <td key={label}
                          className="border-r border-slate-100 p-2 align-top last:border-r-0"
                          style={{ minWidth: 136 }}
                        >
                          {meal
                            ? <MealCard meal={meal} onRemove={() => handleRemoveMeal(day, slot)} />
                            : <EmptyCell onClick={() => openFromCell(day, slot)} />
                          }
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
          <p className="mb-3 text-[11px] text-slate-400">Week of {weekLabel}</p>

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

      {/* ── Add Meal Modal ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Add Meal</h3>
                {fromCell && (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {modalDay} · {modalSlot}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-5">

              {/* Day + Slot — only when opened from Create Plan button */}
              {!fromCell && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">Day</label>
                    <div className="relative">
                      <select value={modalDay} onChange={e => setModalDay(e.target.value as DayLabel)} className={SELECT_CLS}>
                        {DAYS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">Slot</label>
                    <div className="relative">
                      <select value={modalSlot} onChange={e => setModalSlot(e.target.value as MealSlot)} className={SELECT_CLS}>
                        {MEAL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Meal name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Meal Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => { setFormName(e.target.value); setNameError(false); }}
                  onKeyDown={e => e.key === "Enter" && handleAddMeal()}
                  placeholder="e.g. Grilled Chicken Salad"
                  className={`${INPUT_CLS} ${nameError ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  autoFocus
                />
                {nameError && <p className="text-[11px] text-red-500">Meal name is required.</p>}
                {liveMeta && !nameError && (
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{liveMeta.emoji}</span>
                    <span>~{liveMeta.cal} kcal auto-detected</span>
                  </p>
                )}
              </div>

              {/* Plan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Plan</label>
                <div className="relative">
                  <select value={formPlan} onChange={e => setFormPlan(e.target.value)} className={SELECT_CLS}>
                    {PLANNER_PLAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Status</label>
                <div className="flex gap-2">
                  {(["booked", "confirmed", "pending"] as MealStatus[]).map(s => (
                    <button key={s} type="button"
                      onClick={() => setFormStatus(s)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                        formStatus === s
                          ? STATUS_STYLE[s]
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button type="button" onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button type="button" onClick={handleAddMeal}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

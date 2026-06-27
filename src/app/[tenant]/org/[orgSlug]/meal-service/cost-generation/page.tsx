"use client";

import { useState, useRef, useCallback, Fragment } from "react";
import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Upload, FileText, Trash2, Plus, CheckCircle2,
  HelpCircle, ChevronRight, Calculator, Lightbulb,
  Download, TableProperties, AlertCircle, Zap, Users, Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SlideUp, SlideIn } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface IngredientItem {
  id:              string;
  name:            string;
  date?:           string; // purchase date from CSV
  qty:             string;
  unit:            string;
  unitPrice:       string;
  total:           string; // plain numeric string — no currency symbol
  purchaseQty?:    string;
  amountPaid?:     string;
  priceSource:     "direct" | "calculated";
}

interface DailyUpload {
  id:       string;
  date:     string;           // YYYY-MM-DD
  filename: string;
  source:   "receipt" | "csv";
  items:    IngredientItem[];
}

type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack";

/* ── Payment configuration (mirrors Settings → Payment → Default Currency) ── */
const PAYMENT_CONFIG = { code: "BDT", symbol: "৳" } as const;

/** Format a number or numeric string with the payment currency symbol. */
function fmt(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return `${PAYMENT_CONFIG.symbol}${isNaN(num) ? "0.00" : num.toFixed(2)}`;
}

/** Number of complete 7-day weeks in the given month (e.g. June 30d → 4). */
function getWeeksInMonth(date: Date): number {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.floor(daysInMonth / 7);
}

/* ── Org-scoped active member counts ────────────────────────────────────── */
// Keyed by orgSlug — each org sees only its own enrolled member count.
const ORG_MEMBER_COUNTS: Record<string, number> = {
  "nutracorp":    284,
  "applecorp":    156,
  "health-first": 412,
  "greenlife":    198,
  "megabite":     321,
};
const DEFAULT_ORG_MEMBERS = 284;

function getOrgActiveMembers(slug: string): number {
  return ORG_MEMBER_COUNTS[slug?.toLowerCase()] ?? DEFAULT_ORG_MEMBERS;
}

/* ── Meal type definitions ──────────────────────────────────────────────── */
const MEAL_TYPE_DEFS: {
  key:    MealTypeKey;
  label:  string;
  emoji:  string;
  border: string;
  bg:     string;
  text:   string;
}[] = [
  { key: "breakfast", label: "Breakfast", emoji: "🌅", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  { key: "lunch",     label: "Lunch",     emoji: "☀️",  border: "border-orange-200",  bg: "bg-orange-50",  text: "text-orange-700"  },
  { key: "dinner",    label: "Dinner",    emoji: "🌙", border: "border-violet-200",  bg: "bg-violet-50",  text: "text-violet-700"  },
  { key: "snack",     label: "Snack",     emoji: "🥤", border: "border-sky-200",     bg: "bg-sky-50",     text: "text-sky-700"     },
];

/* ── Mock defaults (receipt extraction simulation) ──────────────────────── */
// `total` stores a plain numeric string — currency symbol applied only at display.
const DEFAULT_ITEMS: IngredientItem[] = [
  { id:"i1",  name:"Chicken Breast",     qty:"2.5", unit:"kg",   unitPrice:"1.67",  total:"4.18",  purchaseQty:"3",   amountPaid:"5.00", priceSource:"calculated" },
  { id:"i2",  name:"Brown Rice",         qty:"1.0", unit:"kg",   unitPrice:"2.80",  total:"2.80",  priceSource:"direct"     },
  { id:"i3",  name:"Mixed Vegetables",   qty:"1.5", unit:"kg",   unitPrice:"3.20",  total:"4.80",  purchaseQty:"2",   amountPaid:"6.40", priceSource:"calculated" },
  { id:"i4",  name:"Olive Oil",          qty:"250", unit:"ml",   unitPrice:"0.012", total:"3.00",  purchaseQty:"250", amountPaid:"3.00", priceSource:"calculated" },
  { id:"i5",  name:"Garlic",             qty:"50",  unit:"g",    unitPrice:"0.04",  total:"2.00",  priceSource:"direct"     },
  { id:"i6",  name:"Lemon",              qty:"3",   unit:"pcs",  unitPrice:"0.50",  total:"1.50",  priceSource:"direct"     },
  { id:"i7",  name:"Herbs & Spices",     qty:"30",  unit:"g",    unitPrice:"0.20",  total:"6.00",  priceSource:"direct"     },
  { id:"i8",  name:"Quinoa",             qty:"500", unit:"g",    unitPrice:"0.012", total:"6.00",  purchaseQty:"500", amountPaid:"6.00", priceSource:"calculated" },
  { id:"i9",  name:"Seasonal Greens",    qty:"800", unit:"g",    unitPrice:"0.004", total:"3.20",  priceSource:"direct"     },
  { id:"i10", name:"Greek Yogurt",       qty:"500", unit:"ml",   unitPrice:"0.008", total:"4.00",  priceSource:"direct"     },
  { id:"i11", name:"Almonds",            qty:"200", unit:"g",    unitPrice:"0.025", total:"5.00",  priceSource:"direct"     },
  { id:"i12", name:"Feta Cheese",        qty:"250", unit:"g",    unitPrice:"0.028", total:"7.00",  priceSource:"direct"     },
  { id:"i13", name:"Tomatoes",           qty:"1.0", unit:"kg",   unitPrice:"2.20",  total:"2.20",  priceSource:"direct"     },
  { id:"i14", name:"Cucumber",           qty:"500", unit:"g",    unitPrice:"1.80",  total:"0.90",  priceSource:"direct"     },
  { id:"i15", name:"Avocado",            qty:"4",   unit:"pcs",  unitPrice:"1.20",  total:"4.80",  priceSource:"direct"     },
  // Transportation cost entered as a regular item row — detected by name and surfaced in Paid Calculations
  { id:"i16", name:"Transportation Cost", qty:"1",  unit:"trip", unitPrice:"30",    total:"30.00", priceSource:"direct"     },
];

const COST_BREAKDOWN = [
  { name: "Protein",    value: 34, color: "#6366f1" },
  { name: "Carbs",      value: 22, color: "#22c55e" },
  { name: "Fats",       value: 18, color: "#f59e0b" },
  { name: "Vegetables", value: 16, color: "#f43f5e" },
  { name: "Other",      value: 10, color: "#a5b4fc" },
];

const TIPS = [
  "Buying ingredients in bulk typically reduces cost per meal by 15–25%.",
  "Seasonal produce is usually 30–40% cheaper and fresher.",
  "Simplify recipes to reduce prep time and labour overhead costs.",
];

/* ── CSV helpers ─────────────────────────────────────────────────────────── */
const CSV_HEADERS = ["Date", "Item Name", "Qty", "Unit", "Unit Price", "Purchase Qty", "Amount Paid"];

// Date column is injected at download time so it always reflects the current day
const CSV_SAMPLE_ROWS = [
  // Regular ingredient rows — use Unit Price OR Purchase Qty + Amount Paid
  ["Chicken",            "3.1", "kg",    "",   "2",  "550"],
  ["Olive Oil",          "1",   "L",     "",   "210","210"],
  ["Brown Rice",         "1",   "kg",    "65", "5",  "320"],
  ["Garlic",             "50",  "g",     "",   "50", "100"],
  ["Mixed Vegetables",   "2",   "Piece", "20", "",   ""   ],
  // Add transportation/delivery cost as its own item row:
  ["Transportation Cost","1",   "trip",  "30", "",   ""   ],
];

function buildCsvContent(): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const rows  = [CSV_HEADERS, ...CSV_SAMPLE_ROWS.map(r => [today, ...r])];
  return rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
}

function downloadTemplate() {
  const content  = buildCsvContent();
  const blob     = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement("a");
  link.href      = url;
  link.download  = "cost_generation_template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): IngredientItem[] | null {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;

  const headers     = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const dateIdx     = headers.findIndex(h => h === "date" || h.includes("date"));
  const nameIdx     = headers.findIndex(h => h.includes("item") || h.includes("name") || h === "ingredient");
  const qtyIdx      = headers.findIndex(h => h === "qty" || h.includes("quantity") || h === "amount");
  const unitIdx     = headers.findIndex(h => h === "unit");
  const priceIdx    = headers.findIndex(h => h === "unit price" || h === "price" || h === "unitprice" || h === "cost");
  const purchaseIdx = headers.findIndex(h => h.includes("purchase") || h === "purchase qty" || h === "purchaseqty");
  const paidIdx     = headers.findIndex(h => h.includes("paid") || h === "amount paid" || h === "total paid");

  if (nameIdx === -1 || qtyIdx === -1) return null;

  return lines.slice(1).map((line, i) => {
    const cells = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
    const date  = dateIdx  >= 0 ? (cells[dateIdx]  ?? "") : "";
    const name  = cells[nameIdx]  ?? "";
    const qty   = cells[qtyIdx]   ?? "0";
    const unit  = unitIdx >= 0 ? (cells[unitIdx] ?? "") : "";

    const rawUnitPrice   = priceIdx    >= 0 ? (cells[priceIdx]    ?? "") : "";
    const rawPurchaseQty = purchaseIdx >= 0 ? (cells[purchaseIdx] ?? "") : "";
    const rawAmountPaid  = paidIdx     >= 0 ? (cells[paidIdx]     ?? "") : "";

    // Strip any currency symbols before parsing
    let unitPrice   = rawUnitPrice.replace(/[৳$,]/g, "");
    let priceSource: IngredientItem["priceSource"] = "direct";
    let purchaseQty: string | undefined;
    let amountPaid:  string | undefined;

    // Mode A: auto-calculate unit price from purchase qty + amount paid
    if ((!unitPrice || parseFloat(unitPrice) === 0) && rawPurchaseQty && rawAmountPaid) {
      const pQty  = parseFloat(rawPurchaseQty);
      const pPaid = parseFloat(rawAmountPaid.replace(/[৳$,]/g, ""));
      if (pQty > 0) {
        unitPrice   = (pPaid / pQty).toFixed(4);
        priceSource = "calculated";
        purchaseQty = rawPurchaseQty;
        amountPaid  = pPaid.toFixed(2);
      }
    }

    let finalQty = parseFloat(qty) || 0;
    let total: string;

    // Mode B: flat-fee row — qty and purchase qty are both blank, only Amount Paid given
    // (e.g. "Transportation Cost","","","","","40" → total = 40, qty treated as 1)
    if (
      finalQty === 0 &&
      !rawPurchaseQty &&
      rawAmountPaid &&
      (!unitPrice || parseFloat(unitPrice) === 0)
    ) {
      const flatAmount = parseFloat(rawAmountPaid.replace(/[৳$,]/g, ""));
      unitPrice = flatAmount.toFixed(2);
      finalQty  = 1;
      total     = flatAmount.toFixed(2);
      priceSource = "direct";
    } else {
      const upNum = parseFloat(unitPrice) || 0;
      total = (finalQty * upNum).toFixed(2);
    }

    const displayQty = finalQty === 1 && !qty ? "1" : (qty || String(finalQty));

    return { id: `csv-${i}`, name, date: date || undefined, qty: displayQty, unit, unitPrice, total, purchaseQty, amountPaid, priceSource };
  }).filter(it => it.name);
}

/* ── Upload tabs ─────────────────────────────────────────────────────────── */
type UploadTab = "receipt" | "csv";

/* ── Receipt upload zone ────────────────────────────────────────────────── */
function ReceiptUploadZone({ onUpload }: { onUpload: () => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <motion.div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); onUpload(); }}
      animate={{ borderColor: dragging ? "#6366f1" : "#e2e8f0", backgroundColor: dragging ? "#eef2ff" : "#f8fafc" }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
    >
      <motion.div
        animate={{ scale: dragging ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100"
      >
        <Upload className="h-6 w-6 text-indigo-600" />
      </motion.div>
      <p className="mt-4 text-sm font-semibold text-slate-900">Drag &amp; drop your receipt here</p>
      <p className="mt-1 text-xs text-slate-500">Supports JPG, PNG, or PDF · up to 10 MB</p>
      <div className="mt-5 flex items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onUpload} />
        <Button size="sm" icon={Upload} onClick={() => inputRef.current?.click()}>Choose File</Button>
      </div>
    </motion.div>
  );
}

/* ── CSV upload zone ────────────────────────────────────────────────────── */
function CsvUploadZone({
  onParsed,
  onError,
}: {
  onParsed: (items: IngredientItem[], filename: string) => void;
  onError:  (msg: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sym = PAYMENT_CONFIG.symbol;

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      onError("Only .csv files are accepted. Please download the template, fill it in, and upload.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text  = e.target?.result as string;
      const items = parseCsv(text);
      if (!items || items.length === 0) {
        onError("Could not read the CSV. Ensure it uses the template columns: Item Name, Qty, Unit, Unit Price, Purchase Qty, Amount Paid.");
      } else {
        onParsed(items, file.name);
      }
    };
    reader.readAsText(file);
  }, [onParsed, onError]);

  return (
    <div className="flex flex-col gap-4">
      {/* Download template strip */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <TableProperties className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-900">Step 1 — Download the template</p>
            <p className="text-[11px] text-emerald-700">
              Use <span className="font-medium">Unit Price</span> directly, or leave it blank and fill
              {" "}<span className="font-medium">Purchase Qty + Amount Paid</span> — unit price auto-calculates.
            </p>
          </div>
        </div>
        <Button size="sm" variant="success" icon={Download} onClick={downloadTemplate} className="shrink-0">
          Template
        </Button>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) readFile(file);
        }}
        animate={{ borderColor: dragging ? "#22c55e" : "#e2e8f0", backgroundColor: dragging ? "#f0fdf4" : "#f8fafc" }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
      >
        <motion.div
          animate={{ scale: dragging ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100"
        >
          <FileText className="h-6 w-6 text-emerald-600" />
        </motion.div>
        <p className="mt-4 text-sm font-semibold text-slate-900">Step 2 — Upload filled CSV</p>
        <p className="mt-1 text-xs text-slate-500">Drag &amp; drop or browse for your completed template</p>
        <div className="mt-5 flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }}
          />
          <Button size="sm" variant="outline" icon={Upload} onClick={() => inputRef.current?.click()}>
            Choose CSV
          </Button>
        </div>
      </motion.div>

      {/* Pricing mode hint */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5">
          <span className="mt-0.5 text-sm font-bold text-indigo-500 leading-none">{sym}</span>
          <div>
            <p className="text-[11px] font-semibold text-indigo-800">Direct Unit Price</p>
            <p className="mt-0.5 text-[10px] text-indigo-600 leading-relaxed">
              Fill <strong>Unit Price</strong> column. Leave Purchase Qty &amp; Amount Paid blank.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-[11px] font-semibold text-emerald-800">Auto-Calculate</p>
            <p className="mt-0.5 text-[10px] text-emerald-600 leading-relaxed">
              Leave Unit Price blank. Fill <strong>Purchase Qty</strong> and{" "}
              <strong>Amount Paid</strong>. Unit price = paid ÷ qty.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Example: <strong>Chicken 3 kg</strong> for <strong>{sym}550</strong> → unit price = {sym}183.33/kg.
          {" "}To include delivery charges, add a row: <strong>Item Name = "Transportation Cost"</strong>, Qty = 1, Unit = trip, Unit Price = 30 — it auto-appears in Paid Calculations.
          {" "}Currency: <strong>{PAYMENT_CONFIG.code} ({sym})</strong> · configured in Payment Settings.
        </p>
      </div>
    </div>
  );
}

/* ── Meal type counter ──────────────────────────────────────────────────── */
function MealTypeCountGrid({
  counts,
  onChange,
}: {
  counts: Record<MealTypeKey, number>;
  onChange: (key: MealTypeKey, value: number) => void;
}) {
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MEAL_TYPE_DEFS.map(mt => (
          <motion.div
            key={mt.key}
            whileHover={{ y: -1 }}
            className={`rounded-xl border ${mt.border} ${mt.bg} p-3`}
          >
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-base leading-none">{mt.emoji}</span>
              <span className={`text-[11px] font-semibold ${mt.text}`}>{mt.label}</span>
            </div>
            <input
              type="number"
              min={0}
              value={counts[mt.key]}
              onChange={e => onChange(mt.key, Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-white/60 bg-white/70 px-2.5 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center"
            />
            <p className={`mt-1 text-center text-[10px] ${mt.text} opacity-70`}>meals</p>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs text-slate-500">
          {MEAL_TYPE_DEFS.filter(mt => counts[mt.key] > 0).map(mt => (
            `${counts[mt.key]} ${mt.label}`
          )).join(" · ") || "No meals entered"}
        </span>
        <span className="text-xs font-bold text-slate-900">{total} total</span>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function CostGenerationPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgName     = orgSlug
    ? orgSlug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
    : "your organisation";

  const [uploadTab,    setUploadTab]    = useState<UploadTab>("receipt");
  const [uploads,      setUploads]      = useState<DailyUpload[]>([]);
  const [csvError,     setCsvError]     = useState<string | null>(null);
  const [mealCounts,   setMealCounts]   = useState<Record<MealTypeKey, number>>({
    breakfast: 5,
    lunch:     8,
    dinner:    7,
    snack:     3,
  });
  // Pre-filled from org-scoped member count; user can override.
  const [activeMembers, setActiveMembers] = useState(() => getOrgActiveMembers(orgSlug));

  // Flat list of all items across all uploaded days
  const items    = uploads.flatMap(u => u.items);
  const uploaded = uploads.length > 0;

  const sym        = PAYMENT_CONFIG.symbol;
  const mealsCount = Object.values(mealCounts).reduce((s, v) => s + v, 0);

  function updateMealCount(key: MealTypeKey, value: number) {
    setMealCounts(prev => ({ ...prev, [key]: value }));
  }

  /* Derive totals — `total` is a plain numeric string so no symbol stripping needed */
  const totalAmount = items.length > 0
    ? items.reduce((acc, it) => acc + parseFloat(it.total || "0"), 0)
    : 76.20;

  const costPerMeal    = mealsCount > 0 ? (totalAmount / mealsCount).toFixed(2) : "0.00";
  const dailyCost      = activeMembers > 0 ? (Number(costPerMeal) * activeMembers).toFixed(2) : "0.00";
  const monthlyCost    = (Number(dailyCost) * 30).toFixed(2);
  const calcCount      = items.filter(it => it.priceSource === "calculated").length;
  // Items whose name contains "transport" are treated as the delivery/freight cost row
  const transportItems   = items.filter(it => it.name.toLowerCase().includes("transport"));
  const transportTotal   = transportItems.reduce((s, it) => s + parseFloat(it.total || "0"), 0);
  const transportPerMeal = mealsCount > 0 ? transportTotal / mealsCount : 0;

  // Trip count = sum of qty across all transport rows (1 trip per purchase run, going + return)
  const transportTrips     = transportItems.reduce((s, it) => s + (parseFloat(it.qty) || 0), 0);
  const weeksInMonth       = getWeeksInMonth(new Date());
  const transportThreshold = weeksInMonth * 2; // 1 go + 1 return per week
  const showTransportTip   = transportTrips > transportThreshold;

  function mergeUpload(newUpload: DailyUpload) {
    setUploads(prev => {
      // Replace any existing entry for the same date, then sort ascending by date
      const without = prev.filter(u => u.date !== newUpload.date);
      return [...without, newUpload].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  function handleReceiptUpload() {
    const today = new Date().toISOString().split("T")[0];
    setCsvError(null);
    setTimeout(() => {
      mergeUpload({
        id:       `receipt-${Date.now()}`,
        date:     today,
        filename: `receipt_${today}.jpg`,
        source:   "receipt",
        items:    DEFAULT_ITEMS.map((it, i) => ({ ...it, id: `${today}-r${i}`, date: today })),
      });
    }, 600);
  }

  function handleCsvParsed(parsed: IngredientItem[], filename: string) {
    setCsvError(null);
    const today = new Date().toISOString().split("T")[0];

    // Group items by date, preserving CSV row order within each group
    const byDate = parsed.reduce<Record<string, IngredientItem[]>>((acc, it) => {
      const d = it.date || today;
      (acc[d] ??= []).push(it);
      return acc;
    }, {});

    // Build all new uploads sorted ascending by date in one pass
    const newUploads: DailyUpload[] = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayItems]) => ({
        id:     `csv-${date}`,
        date,
        filename,
        source: "csv" as const,
        items:  dayItems.map((it, i) => ({ ...it, id: `${date}-c${i}` })),
      }));

    // Single state update: replace any existing entries for these dates, re-sort
    setUploads(prev => {
      const incoming = new Set(newUploads.map(u => u.date));
      const kept     = prev.filter(u => !incoming.has(u.date));
      return [...kept, ...newUploads].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  function handleReset() {
    setUploads([]);
    setCsvError(null);
  }

  function removeUpload(uploadId: string) {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  }

  function removeItem(itemId: string) {
    setUploads(prev =>
      prev
        .map(u => ({ ...u, items: u.items.filter(it => it.id !== itemId) }))
        .filter(u => u.items.length > 0)
    );
  }

  const tabBase   = "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors";
  const tabActive = "bg-white text-indigo-700 shadow-sm";
  const tabInact  = "text-slate-500 hover:text-slate-700";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Generate Meal Cost</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Upload a receipt or use the CSV template to calculate cost per meal.
            Currency: <span className="font-medium text-slate-700">{PAYMENT_CONFIG.code} ({sym})</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={downloadTemplate}>
            CSV Template
          </Button>
          <Button variant="secondary" size="sm" icon={HelpCircle}>How it Works</Button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: steps */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Step 1 — Upload */}
          <SlideUp className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</div>
              <h2 className="text-sm font-semibold text-slate-900">Upload Source</h2>
            </div>

            <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
              <motion.button type="button" whileTap={{ scale: 0.97 }}
                onClick={() => setUploadTab("receipt")}
                className={`${tabBase} ${uploadTab === "receipt" ? tabActive : tabInact}`}
              >
                <Upload className="h-3.5 w-3.5" />
                Receipt / Image
              </motion.button>
              <motion.button type="button" whileTap={{ scale: 0.97 }}
                onClick={() => setUploadTab("csv")}
                className={`${tabBase} ${uploadTab === "csv" ? tabActive : tabInact}`}
              >
                <TableProperties className="h-3.5 w-3.5" />
                CSV Template
              </motion.button>
            </div>

            {/* Uploaded days list */}
            <AnimatePresence>
              {uploads.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 overflow-hidden"
                >
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Uploaded Days ({uploads.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {[...uploads].sort((a, b) => a.date.localeCompare(b.date)).map(upload => {
                      const dayTotal   = upload.items.reduce((s, it) => s + parseFloat(it.total || "0"), 0);
                      const dayCalc    = upload.items.filter(it => it.priceSource === "calculated").length;
                      return (
                        <motion.div
                          key={upload.id}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                            {upload.source === "csv"
                              ? <TableProperties className="h-4 w-4 text-emerald-600" />
                              : <FileText className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <Calendar className="h-2.5 w-2.5" />{upload.date}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">{upload.filename}</span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-emerald-700">
                              {upload.items.length} items · {fmt(dayTotal)}
                              {dayCalc > 0 && ` · ${dayCalc} auto-priced`}
                            </p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <button type="button" onClick={() => removeUpload(upload.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-emerald-100 hover:text-rose-500 transition-colors"
                            aria-label={`Remove ${upload.date}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload zone — always visible so user can add more days */}
            <AnimatePresence mode="wait">
              <motion.div
                key={uploadTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {uploadTab === "receipt"
                  ? <ReceiptUploadZone onUpload={handleReceiptUpload} />
                  : <CsvUploadZone onParsed={handleCsvParsed} onError={msg => setCsvError(msg)} />
                }
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {csvError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-start gap-2.5 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-xs text-red-700">{csvError}</p>
                  <button type="button" onClick={() => setCsvError(null)}
                    className="ml-auto shrink-0 text-red-400 hover:text-red-600 text-xs underline"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </SlideUp>

          {/* Step 2 — Meal type counts + active members */}
          <SlideUp delay={0.04} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">2</div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Number of Meals by Type</h2>
                <p className="text-[11px] text-slate-400">Enter how many meals of each type this ingredient batch covers.</p>
              </div>
            </div>

            <MealTypeCountGrid counts={mealCounts} onChange={updateMealCount} />

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Total Active Members</label>
                  <span className="flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                    <Users className="h-2.5 w-2.5" />
                    auto-filled
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  value={activeMembers}
                  onChange={e => setActiveMembers(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 284"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Auto-populated from <strong className="text-slate-600">{orgName}</strong> member directory · edit to override
                </p>
              </div>
              {uploads.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 self-start mt-5 sm:mt-0"
                >
                  <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <p className="text-xs text-indigo-700">
                    {uploads.length > 1 && (
                      <><strong>{uploads.length} days</strong> uploaded · </>
                    )}
                    Total <strong>{fmt(totalAmount)}</strong> ÷ <strong>{mealsCount} meals</strong> = <strong>{fmt(costPerMeal)} / meal</strong>.
                    {" "}Serving <strong>{activeMembers.toLocaleString()} {orgName} members</strong> = <strong>{fmt(Number(dailyCost).toFixed(2))} / day</strong>.
                    {uploads.length > 1 && (
                      <> · Daily avg spend: <strong>{fmt(totalAmount / uploads.length)}</strong></>
                    )}
                    {calcCount > 0 && ` · ${calcCount} unit prices auto-calculated`}
                  </p>
                </motion.div>
              )}
            </div>
          </SlideUp>

          {/* Step 3 — Extracted items table */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Ingredients — {uploads.length > 1 ? `${uploads.length} days` : uploads[0]?.date ?? "Today"}
                      </h2>
                      <p className="text-[11px] text-slate-400">Prices in {PAYMENT_CONFIG.code} ({sym}) · grouped by date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600">
                      {items.length} items
                    </span>
                    {calcCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Zap className="h-3 w-3" />
                        {calcCount} auto-priced
                      </span>
                    )}
                    <Button variant="outline" size="sm" icon={Download}
                      onClick={() => {
                        const rows = [
                          ["Date","Item Name","Qty","Unit","Unit Price","Purchase Qty","Amount Paid","Total","Price Source","Currency"],
                          ...items.map(it => [
                            it.date ?? "",
                            it.name, it.qty, it.unit,
                            `${sym}${it.unitPrice}`,
                            it.purchaseQty ?? "",
                            it.amountPaid ? `${sym}${it.amountPaid}` : "",
                            fmt(it.total),
                            it.priceSource,
                            PAYMENT_CONFIG.code,
                          ]),
                        ];
                        const csv  = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const url  = URL.createObjectURL(blob);
                        const a    = document.createElement("a");
                        a.href = url; a.download = "cost_items_export.csv"; a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export
                    </Button>
                    <Button variant="secondary" size="sm" icon={Plus}>Add Item</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-slate-50 bg-slate-50">
                      <tr>
                        {["#", "Date", "Item Name", "Recipe Qty", "Unit", `Unit Price (${sym})`, "Purchase Info", `Total (${sym})`, ""].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...uploads].sort((a, b) => a.date.localeCompare(b.date)).map(upload => {
                        const dayTotal = upload.items.reduce((s, it) => s + parseFloat(it.total || "0"), 0);
                        return (
                          <Fragment key={upload.id}>
                            {/* Date group header */}
                            <tr className="border-b border-indigo-100 bg-indigo-50">
                              <td colSpan={9} className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                  <span className="text-[11px] font-bold text-indigo-700">{upload.date}</span>
                                  <span className="text-[10px] text-indigo-400">·</span>
                                  <span className="text-[10px] text-indigo-500">{upload.items.length} items</span>
                                  <span className="text-[10px] text-indigo-400">·</span>
                                  <span className="text-[10px] font-semibold text-indigo-600">{fmt(dayTotal)}</span>
                                  <span className="ml-auto text-[10px] text-indigo-400 truncate">{upload.filename}</span>
                                </div>
                              </td>
                            </tr>
                            {/* Items for this day */}
                            {upload.items.map((item, i) => (
                              <motion.tr
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02, duration: 0.2 }}
                                className="hover:bg-slate-50/60 transition-colors"
                              >
                                <td className="px-4 py-2.5 font-medium text-slate-400">{i + 1}</td>
                                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                    <Calendar className="h-2.5 w-2.5 text-slate-400" />
                                    {item.date ?? upload.date}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-medium text-slate-900">{item.name}</td>
                                <td className="px-4 py-2.5 text-slate-600">{item.qty}</td>
                                <td className="px-4 py-2.5 text-slate-500">{item.unit}</td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-600">{sym}{item.unitPrice}/{item.unit || "unit"}</span>
                                    {item.priceSource === "calculated" && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600">
                                        <Zap className="h-2.5 w-2.5" />auto-calc
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  {item.purchaseQty && item.amountPaid ? (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                                      {item.purchaseQty} {item.unit} = {sym}{item.amountPaid}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-slate-900">{fmt(item.total)}</td>
                                <td className="px-4 py-2.5">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    type="button" onClick={() => removeItem(item.id)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))}
                            {/* Day subtotal row (only shown when multiple days) */}
                            {uploads.length > 1 && (
                              <tr className="border-b border-indigo-100 bg-indigo-50/40">
                                <td colSpan={7} className="px-4 py-1.5 text-right text-[10px] font-semibold text-indigo-500">
                                  {upload.date} subtotal
                                </td>
                                <td className="px-4 py-1.5 text-[11px] font-bold text-indigo-700">{fmt(dayTotal)}</td>
                                <td />
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50">
                      <tr>
                        <td colSpan={7} className="px-4 py-2.5 font-semibold text-slate-700 text-right">Total ({PAYMENT_CONFIG.code}):</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(totalAmount)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Meal type cost breakdown */}
                <div className="border-t border-slate-100 px-4 py-3">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cost per meal type</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {MEAL_TYPE_DEFS.map(mt => {
                      const count     = mealCounts[mt.key];
                      const costShare = mealsCount > 0 && count > 0
                        ? ((count / mealsCount) * totalAmount)
                        : 0;
                      const perMeal   = count > 0 ? (costShare / count).toFixed(2) : null;
                      return (
                        <div key={mt.key} className={`rounded-lg border ${mt.border} ${mt.bg} px-3 py-2`}>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm">{mt.emoji}</span>
                            <span className={`text-[11px] font-semibold ${mt.text}`}>{mt.label}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {perMeal ? `${sym}${perMeal}` : "—"}
                            <span className="text-[10px] font-normal text-slate-400">/meal</span>
                          </p>
                          <p className={`text-[10px] ${mt.text} opacity-70`}>
                            {count} meals · {fmt(costShare)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-3">
                  <Button variant="secondary" size="sm" onClick={handleReset}>Reset</Button>
                  <Button size="sm" icon={Calculator}>Generate Cost Report</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">

          {/* CSV template card */}
          <SlideIn from="right">
            <motion.div
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(34,197,94,0.12)" }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <TableProperties className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">CSV Template</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                    Supports both direct unit price and purchase-amount entry.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-[11px]">
                {[
                  { col: "A", label: "Date",         note: "auto-filled with today's date (YYYY-MM-DD)" },
                  { col: "B", label: "Item Name",    note: "e.g. Chicken or Transportation Cost" },
                  { col: "C", label: "Qty",          note: "recipe qty" },
                  { col: "D", label: "Unit",         note: "kg / ml / g / pcs / trip" },
                  { col: "E", label: "Unit Price",   note: `${PAYMENT_CONFIG.code} (optional)` },
                  { col: "F", label: "Purchase Qty", note: "e.g. 3 for 3 kg" },
                  { col: "G", label: "Amount Paid",  note: `e.g. ${sym}550` },
                ].map(({ col, label, note }) => (
                  <div key={col} className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-100 text-[9px] font-bold text-emerald-700">{col}</span>
                    <span className="font-medium text-slate-700">{label}</span>
                    {note && <span className="text-slate-400">{note}</span>}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 p-2">
                <Zap className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <p className="text-[10px] text-emerald-700">
                  D is optional — fill E+F to auto-calculate unit price.
                  Add a row named <strong>"Transportation Cost"</strong> (e.g. qty=1, unit=trip, unit price=30) — it will be auto-detected and shown in Paid Calculations.
                </p>
              </div>
              <Button fullWidth variant="success" size="sm" icon={Download} className="mt-3" onClick={downloadTemplate}>
                Download Template
              </Button>
            </motion.div>
          </SlideIn>

          {/* Cost summary */}
          <SlideIn from="right" delay={0.04} className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-indigo-200">Estimated Cost Summary</p>
              <span className="rounded-full border border-indigo-400/50 bg-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-100">
                {PAYMENT_CONFIG.code}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {[
                { label: "Total Amount",                                      val: fmt(totalAmount),                                 lg: false },
                { label: "Cost Per Meal",                                     val: fmt(costPerMeal),                                 lg: true  },
                { label: `Daily (${activeMembers.toLocaleString()} members)`, val: `${sym}${Number(dailyCost).toLocaleString()}`,    lg: false },
                { label: "Monthly Est.",                                      val: `${sym}${Number(monthlyCost).toLocaleString()}`,  lg: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-indigo-200">{item.label}</span>
                  <span className={`font-bold text-white ${item.lg ? "text-2xl" : "text-sm"}`}>{item.val}</span>
                </div>
              ))}
            </div>
            {/* Daily spend breakdown (multi-day only) */}
            {uploads.length > 1 && (
              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                  By day · {uploads.length} days
                </p>
                <div className="flex flex-col gap-1.5">
                  {uploads.map(upload => {
                    const dayTotal = upload.items.reduce((s, it) => s + parseFloat(it.total || "0"), 0);
                    return (
                      <div key={upload.id} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-indigo-200">
                          <Calendar className="h-3 w-3" />{upload.date}
                        </span>
                        <span className="font-semibold text-white">{fmt(dayTotal)}</span>
                      </div>
                    );
                  })}
                  <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-1.5 text-[11px]">
                    <span className="text-indigo-300">Avg / day</span>
                    <span className="font-bold text-white">{fmt(totalAmount / uploads.length)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Meal type mini breakdown */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">By meal type · {orgName}</p>
              <div className="flex flex-col gap-1.5">
                {MEAL_TYPE_DEFS.map(mt => {
                  const count   = mealCounts[mt.key];
                  const perMeal = mealsCount > 0 && count > 0
                    ? (totalAmount / mealsCount).toFixed(2)
                    : null;
                  return (
                    <div key={mt.key} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-indigo-200">
                        <span>{mt.emoji}</span>{mt.label}
                        <span className="text-indigo-400">({count})</span>
                      </span>
                      <span className="font-semibold text-white">
                        {perMeal ? `${sym}${perMeal}/meal` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SlideIn>

          {/* Cost breakdown chart */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="mb-3 text-sm font-semibold text-slate-900">Cost Breakdown</h2>
                <div className="relative flex items-center justify-center">
                  <div className="h-40 w-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={COST_BREAKDOWN}
                          cx="50%" cy="50%"
                          innerRadius={44} outerRadius={66}
                          dataKey="value"
                          paddingAngle={3}
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {COST_BREAKDOWN.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Currency symbol in donut centre */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-slate-400">{sym}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  {COST_BREAKDOWN.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-600">{d.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paid calculations */}
          <SlideIn from="right" delay={0.08} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Paid Calculations</h2>
            <div className="flex flex-col gap-2 text-xs">
              {[
                {
                  label: "Base Per Meal",
                  val:   fmt(costPerMeal),
                  note:  undefined,
                },
                {
                  label: "Transportation",
                  val:   `+${fmt(transportPerMeal)}`,
                  note:  transportTotal > 0 ? `${sym}${transportTotal.toFixed(2)} total` : "from CSV",
                },
                {
                  label: "Cooking Cost",
                  val:   `+${sym}0.85`,
                  note:  undefined,
                },
                {
                  label: "Packaging",
                  val:   `+${sym}0.45`,
                  note:  undefined,
                },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between border-b border-slate-50 pb-1.5 last:border-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500">{item.label}</span>
                    {item.note && (
                      <span className="text-[10px] text-orange-500">{item.note}</span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-900">{item.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-slate-200 mt-0.5 pt-1.5">
                <span className="font-semibold text-slate-700">Total Per Meal</span>
                <span className="font-bold text-indigo-600 text-sm">
                  {fmt(Number(costPerMeal) + transportPerMeal + 0.85 + 0.45)}
                </span>
              </div>
            </div>
          </SlideIn>

          {/* Tips */}
          <SlideIn from="right" delay={0.12} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <h2 className="text-xs font-semibold text-amber-900">Tips</h2>
            </div>

            {/* Dynamic transport tip — animates in when threshold exceeded */}
            <AnimatePresence>
              {showTransportTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 rounded-lg border border-orange-300 bg-orange-100 px-3 py-2.5">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" />
                    <div>
                      <p className="text-[11px] font-semibold text-orange-900 leading-snug">
                        Transportation cost alert
                      </p>
                      <p className="mt-0.5 text-[10px] text-orange-800 leading-relaxed">
                        <strong>{transportTrips} trips</strong> recorded this period exceeds the
                        expected <strong>{transportThreshold}</strong> ({weeksInMonth} weeks × 2 trips —
                        one to the market, one return). Total transport spend: <strong>{fmt(transportTotal)}</strong>.
                        Paying a fixed monthly transport rate at the{" "}
                        <strong>start of the month</strong> can reduce per-trip overhead
                        and lower your cost per meal.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ul className="flex flex-col gap-2">
              {TIPS.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-2 text-[11px] text-amber-800 leading-relaxed"
                >
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                  {tip}
                </motion.li>
              ))}
            </ul>
          </SlideIn>
        </div>
      </div>
    </div>
  );
}

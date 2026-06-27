"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Download, Filter, Plus, Check, X,
  BookOpen, Copy, Settings, CalendarDays, Users,
  Search, Bell, ClipboardCheck, Upload, FileText,
  ClipboardPaste, FileDown,
} from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";

/* ── Types ───────────────────────────────────────────────────────────────── */

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface MealEntry {
  id:   string;
  name: string;
  type: MealType;
}

interface DayCell {
  date:           number;
  meals:          MealEntry[];
  isCurrentMonth: boolean;
}

/* ── Config ──────────────────────────────────────────────────────────────── */

const TYPE_CONFIG: Record<MealType, { label: string; short: string; color: string; bg: string; text: string; border: string; ring: string }> = {
  breakfast: { label:"Breakfast", short:"BF", color:"#10b981", bg:"bg-emerald-50", text:"text-emerald-700", border:"border-emerald-200", ring:"ring-emerald-400" },
  lunch:     { label:"Lunch",     short:"LN", color:"#f97316", bg:"bg-orange-50",  text:"text-orange-700",  border:"border-orange-200",  ring:"ring-orange-400"  },
  dinner:    { label:"Dinner",    short:"DN", color:"#8b5cf6", bg:"bg-violet-50",  text:"text-violet-700",  border:"border-violet-200",  ring:"ring-violet-400"  },
  snack:     { label:"Snacks",    short:"SN", color:"#0ea5e9", bg:"bg-sky-50",     text:"text-sky-700",     border:"border-sky-200",     ring:"ring-sky-400"     },
};

/* Numeric hours used for positioning in the time grid */
const SLOT_RANGE: Record<MealType, { startH: number; endH: number; display: string }> = {
  breakfast: { startH: 7,  endH: 9,  display: "7:00 – 9:00 AM"  },
  lunch:     { startH: 12, endH: 14, display: "12:00 – 2:00 PM" },
  dinner:    { startH: 18, endH: 20, display: "6:00 – 8:00 PM"  },
  snack:     { startH: 15, endH: 16, display: "3:00 – 4:00 PM"  },
};

const HOUR_PX    = 56;                 // pixels per hour in the time grid
const START_HOUR = 6;                  // first visible hour (6 AM)
const END_HOUR   = 21;                 // last label (9 PM)
const TOTAL_H    = (END_HOUR - START_HOUR + 1) * HOUR_PX;
const HOURS      = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

function fmtHour(h: number) {
  if (h === 0  || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

const DAYS_OF_WEEK  = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const FULL_DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS        = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// June 2025 starts on Sunday → (date - 1) % 7 gives day index
const getDayName = (d: number) => FULL_DAY_NAMES[(d - 1) % 7];

/* Real current date — used for default month and today ring */
const _NOW        = new Date();
const REAL_DATE   = _NOW.getDate();
const REAL_MONTH  = _NOW.getMonth();   // 0-indexed
const REAL_YEAR   = _NOW.getFullYear();
const REAL_DOW    = _NOW.getDay();     // 0 = Sun

/* Week navigation helpers (meal data lives in June 2025; week offset is relative to that) */
const TODAY_DATE      = 27;
const TODAY_DOW       = (TODAY_DATE - 1) % 7; // June 2025 starts on Sunday
const THIS_WEEK_START = TODAY_DATE - TODAY_DOW; // 22 = Sun Jun 22 2025

function weekStartForOffset(offset: number) { return THIS_WEEK_START + offset * 7; }

function weekRangeLabel(weekStart: number): string {
  const end = weekStart + 6;
  if (weekStart < 1)  return `May ${31 + weekStart}–Jun ${end}, 2025`;
  if (end > 30)       return `Jun ${weekStart}–30 · Jul 1–${end - 30}, 2025`;
  return `Jun ${weekStart}–${end}, 2025`;
}

/* ── Mock members (25 people with .test emails) ──────────────────────────── */

const MOCK_MEMBERS = [
  "Alice Chen","Bob Martinez","Carol White","David Park","Emma Wilson",
  "Frank Thomas","Grace Lee","Henry Brown","Iris Davis","James Miller",
  "Kate Johnson","Liam Anderson","Maya Rodriguez","Noah Garcia","Olivia Taylor",
  "Peter Jackson","Quinn Harris","Rachel Martin","Sam Thompson","Tara Lewis",
  "Uma Clark","Victor Hill","Wendy Scott","Xavier Adams","Yara Baker",
];

function getAttendees(date: number, type: MealType): string[] {
  const typeIdx = (["breakfast","lunch","dinner","snack"] as MealType[]).indexOf(type);
  const count   = 5 + ((date * 7 + typeIdx * 13) % 16); // 5–20 attendees
  const start   = (date * 3 + typeIdx * 7) % MOCK_MEMBERS.length;
  return Array.from({ length: count }, (_, i) => MOCK_MEMBERS[(start + i) % MOCK_MEMBERS.length]);
}

function initials(name: string) {
  const parts = name.split(" ");
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-500","bg-violet-500","bg-emerald-500","bg-orange-500","bg-pink-500",
  "bg-sky-500","bg-teal-500","bg-amber-500","bg-rose-500","bg-cyan-500",
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ── Mock calendar data — June 2025 (day 1 = Sunday) ────────────────────── */

const DAY_MEALS: Record<number, MealEntry[]> = {
  1:  [{ id:"b1",  name:"Avocado Toast",         type:"breakfast" }, { id:"l1",  name:"Grilled Chicken Salad", type:"lunch"   }],
  2:  [{ id:"b2",  name:"Oatmeal & Berries",      type:"breakfast" }, { id:"l2",  name:"Caesar Salad",          type:"lunch"   }, { id:"d2",  name:"Salmon Plate",       type:"dinner"  }],
  3:  [{ id:"b3",  name:"Smoothie Bowl",          type:"breakfast" }, { id:"d3",  name:"Pasta Primavera",       type:"dinner"  }],
  4:  [{ id:"l4",  name:"Quinoa Veggie Bowl",     type:"lunch"     }, { id:"d4",  name:"Grilled Steak",         type:"dinner"  }, { id:"s4",  name:"Protein Bar",         type:"snack"   }],
  5:  [{ id:"b5",  name:"Pancakes",               type:"breakfast" }, { id:"l5",  name:"Turkey Wrap",           type:"lunch"   }],
  6:  [{ id:"b6",  name:"Yogurt Parfait",         type:"breakfast" }, { id:"l6",  name:"Veggie Burrito",        type:"lunch"   }, { id:"d6",  name:"Chicken Curry",       type:"dinner"  }],
  7:  [{ id:"b7",  name:"Eggs Benedict",          type:"breakfast" }, { id:"d7",  name:"BBQ Ribs",              type:"dinner"  }],
  8:  [{ id:"b8",  name:"Granola Bowl",           type:"breakfast" }, { id:"l8",  name:"Lentil Soup",           type:"lunch"   }, { id:"d8",  name:"Stir Fry Tofu",      type:"dinner"  }],
  9:  [{ id:"b9",  name:"French Toast",           type:"breakfast" }, { id:"l9",  name:"Greek Salad",           type:"lunch"   }],
  10: [{ id:"l10", name:"Sushi Bowl",             type:"lunch"     }, { id:"d10", name:"Thai Curry",            type:"dinner"  }, { id:"s10", name:"Fruit Salad",         type:"snack"   }],
  11: [{ id:"b11", name:"Chia Pudding",           type:"breakfast" }, { id:"l11", name:"BLT Sandwich",          type:"lunch"   }],
  12: [{ id:"b12", name:"Acai Bowl",              type:"breakfast" }, { id:"l12", name:"Chicken Caesar",        type:"lunch"   }, { id:"d12", name:"Grilled Shrimp",      type:"dinner"  }],
  13: [{ id:"b13", name:"Waffles",                type:"breakfast" }, { id:"d13", name:"Beef Tacos",            type:"dinner"  }],
  14: [{ id:"b14", name:"Overnight Oats",         type:"breakfast" }, { id:"l14", name:"Falafel Wrap",          type:"lunch"   }, { id:"d14", name:"Roast Chicken",       type:"dinner"  }],
  15: [{ id:"b15", name:"Veggie Omelette",        type:"breakfast" }, { id:"l15", name:"Poke Bowl",             type:"lunch"   }],
  16: [{ id:"l16", name:"Tomato Basil Pasta",     type:"lunch"     }, { id:"d16", name:"Lamb Chops",            type:"dinner"  }, { id:"s16", name:"Hummus & Veggies",    type:"snack"   }],
  17: [{ id:"b17", name:"Bagel & Cream Cheese",   type:"breakfast" }, { id:"l17", name:"Caprese Salad",         type:"lunch"   }],
  18: [{ id:"b18", name:"Protein Smoothie",       type:"breakfast" }, { id:"l18", name:"Chicken Sandwich",      type:"lunch"   }, { id:"d18", name:"Veg Fried Rice",      type:"dinner"  }],
  19: [{ id:"b19", name:"Banana Pancakes",        type:"breakfast" }, { id:"d19", name:"Mushroom Risotto",      type:"dinner"  }],
  20: [{ id:"b20", name:"Açaí Smoothie",          type:"breakfast" }, { id:"l20", name:"Pesto Pasta",           type:"lunch"   }, { id:"d20", name:"Fish Tacos",          type:"dinner"  }],
  21: [{ id:"b21", name:"Smoked Salmon Bagel",    type:"breakfast" }, { id:"l21", name:"Corn Chowder",          type:"lunch"   }],
  22: [{ id:"b22", name:"Blueberry Muffin",       type:"breakfast" }, { id:"l22", name:"Veggie Wrap",           type:"lunch"   }, { id:"d22", name:"Grilled Salmon",      type:"dinner"  }],
  23: [{ id:"l23", name:"Mediterranean Bowl",     type:"lunch"     }, { id:"d23", name:"Chicken Stir Fry",      type:"dinner"  }, { id:"s23", name:"Mixed Nuts",          type:"snack"   }],
  24: [{ id:"b24", name:"Egg Muffins",            type:"breakfast" }, { id:"l24", name:"Tuna Salad",            type:"lunch"   }],
  25: [{ id:"b25", name:"Green Smoothie",         type:"breakfast" }, { id:"l25", name:"Burrito Bowl",          type:"lunch"   }, { id:"d25", name:"Beef Stew",           type:"dinner"  }],
  26: [{ id:"b26", name:"Croissant & Eggs",       type:"breakfast" }, { id:"d26", name:"Spaghetti Bolognese",   type:"dinner"  }],
  27: [{ id:"b27", name:"Power Bowl",             type:"breakfast" }, { id:"l27", name:"Club Sandwich",         type:"lunch"   }, { id:"d27", name:"Prawn Curry",         type:"dinner"  }],
  28: [{ id:"b28", name:"Avocado Eggs",           type:"breakfast" }, { id:"l28", name:"Asian Noodles",         type:"lunch"   }],
  29: [{ id:"b29", name:"Fruit Bowl",             type:"breakfast" }, { id:"l29", name:"Quinoa Salad",          type:"lunch"   }, { id:"d29", name:"Lamb Kebabs",         type:"dinner"  }],
  30: [{ id:"l30", name:"Veggie Pizza",           type:"lunch"     }, { id:"d30", name:"Chicken Marsala",       type:"dinner"  }, { id:"s30", name:"Yogurt & Honey",      type:"snack"   }],
};

const DISTRIBUTION = [
  { name:"Breakfast", value:82, color:"#10b981" },
  { name:"Lunch",     value:94, color:"#f97316" },
  { name:"Dinner",    value:54, color:"#8b5cf6" },
  { name:"Snacks",    value:18, color:"#0ea5e9" },
];
const TOTAL_MEALS = DISTRIBUTION.reduce((s, d) => s + d.value, 0);

const UPCOMING = [
  { title:"Grilled Salmon Day",  date:"Jun 22", type:"dinner"    as MealType },
  { title:"Veggie Monday",       date:"Jun 23", type:"lunch"     as MealType },
  { title:"Breakfast Special",   date:"Jun 24", type:"breakfast" as MealType },
  { title:"Community Lunch",     date:"Jun 25", type:"lunch"     as MealType },
  { title:"Pasta Friday",        date:"Jun 26", type:"dinner"    as MealType },
];

/* ── Export / import helpers ─────────────────────────────────────────────── */

interface ExportDay {
  date:      number;
  monthIdx:  number;
  year:      number;
  dayName:   string;   // "Monday"
  monthAbbr: string;   // "Jun"
  meals:     MealEntry[];
}

interface ExportConfig {
  periodLabel: string;   // "June 2025" | "Jun 22–28, 2025" | "Fri, Jun 27, 2025"
  viewLabel:   string;   // "Monthly Schedule" | "Weekly Schedule" | "Daily Schedule"
  days:        ExportDay[];
  filename:    string;   // base name without extension
}

function buildExportConfig(
  viewMode:    "month" | "week",
  selectedDay: number | null,
  monthIdx:    number,
  year:        number,
  weekStart:   number,
): ExportConfig {
  function makeDay(date: number, mi: number, yr: number): ExportDay {
    return {
      date, monthIdx: mi, year: yr,
      dayName:   new Date(yr, mi, date).toLocaleDateString("en-US", { weekday: "long" }),
      monthAbbr: MONTHS[mi].slice(0, 3),
      meals: (mi === 5 && yr === 2025)
        ? [...(DAY_MEALS[date] ?? [])].sort((a, b) => SLOT_RANGE[a.type].startH - SLOT_RANGE[b.type].startH)
        : [],
    };
  }

  // Day view
  if (selectedDay !== null) {
    const d = makeDay(selectedDay, monthIdx, year);
    return {
      periodLabel: `${d.dayName.slice(0, 3)}, ${d.monthAbbr} ${selectedDay}, ${year}`,
      viewLabel:   "Daily Schedule",
      days:        [d],
      filename:    `meal-schedule-${MONTHS[monthIdx].toLowerCase()}-${selectedDay}-${year}`,
    };
  }

  // Week view (week data is anchored to June 2025 demo data)
  if (viewMode === "week") {
    const days: ExportDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = weekStart + i;
      if      (d < 1)  days.push(makeDay(31 + d, 4, 2025));  // May 2025
      else if (d > 30) days.push(makeDay(d - 30, 6, 2025));  // July 2025
      else             days.push(makeDay(d, 5, 2025));         // June 2025
    }
    return {
      periodLabel: weekRangeLabel(weekStart),
      viewLabel:   "Weekly Schedule",
      days,
      filename:    `meal-schedule-week-jun${Math.max(1, weekStart)}-2025`,
    };
  }

  // Month view
  const isJune2025 = monthIdx === 5 && year === 2025;
  return {
    periodLabel: `${MONTHS[monthIdx]} ${year}`,
    viewLabel:   "Monthly Schedule",
    days: isJune2025
      ? Object.keys(DAY_MEALS).map(Number).sort((a, b) => a - b).map(d => makeDay(d, 5, 2025))
      : [],
    filename: `meal-schedule-${MONTHS[monthIdx].toLowerCase()}-${year}`,
  };
}

function exportToPDF(
  bookedSlots: Set<string>,
  userName:    string,
  viewMode:    "month" | "week",
  selectedDay: number | null,
  monthIdx:    number,
  year:        number,
  weekStart:   number,
) {
  const cfg       = buildExportConfig(viewMode, selectedDay, monthIdx, year, weekStart);
  const generated = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const monthLabel  = cfg.periodLabel; // kept for template reuse below

  const TC: Record<MealType, { bg: string; text: string }> = {
    breakfast: { bg:"#ecfdf5", text:"#065f46" },
    lunch:     { bg:"#fff7ed", text:"#9a3412" },
    dinner:    { bg:"#f5f3ff", text:"#4c1d95" },
    snack:     { bg:"#f0f9ff", text:"#0c4a6e" },
  };

  const totalMeals  = cfg.days.reduce((s, d) => s + d.meals.length, 0);
  const bookedCount = cfg.days.reduce((s, d) =>
    s + d.meals.filter(m => bookedSlots.has(`${d.date}:${m.type}`)).length, 0);

  let coverStats = "", typeGrid = "", dayBlocks = "";

  if (cfg.days.length === 0) {
    dayBlocks = `<div class="empty">
      <div class="empty-icon">📅</div>
      <p class="empty-title">No meal data for ${cfg.periodLabel}</p>
      <p class="empty-sub">Meal schedule data is available for June 2025.</p>
    </div>`;
  } else {
    coverStats = `
      <div class="stat"><div class="n">${totalMeals}</div><div class="l">Meals</div></div>
      <div class="stat"><div class="n">${bookedCount}</div><div class="l">Booked</div></div>
      <div class="stat"><div class="n">${totalMeals - bookedCount}</div><div class="l">Available</div></div>`;

    // type breakdown — skip on single-day view (too few rows to be meaningful)
    if (cfg.viewLabel !== "Daily Schedule") {
      const tc: Partial<Record<MealType, { total: number; booked: number }>> = {};
      cfg.days.forEach(day => day.meals.forEach(m => {
        if (!tc[m.type]) tc[m.type] = { total:0, booked:0 };
        tc[m.type]!.total++;
        if (bookedSlots.has(`${day.date}:${m.type}`)) tc[m.type]!.booked++;
      }));
      typeGrid = (Object.keys(TYPE_CONFIG) as MealType[]).map(type => {
        const { label }             = TYPE_CONFIG[type];
        const { bg, text }          = TC[type];
        const { total=0, booked=0 } = tc[type] ?? {};
        return `<div class="type-card" style="background:${bg}">
          <div class="type-name" style="color:${text}">${label}</div>
          <div class="type-big" style="color:${text}">${booked}<span class="type-of">/${total}</span></div>
          <div class="type-sub" style="color:${text}">booked</div>
        </div>`;
      }).join("");
    }

    dayBlocks = cfg.days.map(day => {
      if (day.meals.length === 0) {
        return `<div class="day-block">
          <div class="day-header">
            <span>${day.dayName}, ${day.monthAbbr} ${day.date}</span>
            <span class="day-count" style="background:#fee2e2;color:#991b1b">No data</span>
          </div>
          <div style="padding:12px 16px;font-size:13px;color:#94a3b8">No meals scheduled for this day.</div>
        </div>`;
      }
      const dayBooked = day.meals.filter(m => bookedSlots.has(`${day.date}:${m.type}`)).length;
      const rows = day.meals.map(meal => {
        const booked = bookedSlots.has(`${day.date}:${meal.type}`);
        const { bg, text } = TC[meal.type];
        return `<div class="meal-row${booked ? " booked" : ""}">
          <span class="type-badge" style="background:${bg};color:${text}">${TYPE_CONFIG[meal.type].label}</span>
          <span class="meal-name">${meal.name}</span>
          <span class="meal-time">${SLOT_RANGE[meal.type].display}</span>
          ${booked ? `<span class="pill booked-pill">✓ Booked</span>` : `<span class="pill avail-pill">Available</span>`}
        </div>`;
      }).join("");
      return `<div class="day-block">
        <div class="day-header">
          <span>${day.dayName}, ${day.monthAbbr} ${day.date}</span>
          <span class="day-count">${dayBooked}/${day.meals.length} booked</span>
        </div>${rows}</div>`;
    }).join("");
  }

  // ── HTML template ─────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${cfg.viewLabel} – ${cfg.periodLabel}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;background:#f8fafc}
.cover{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);color:#fff;padding:40px 48px}
.cover h1{font-size:28px;font-weight:800;letter-spacing:-.5px;margin-bottom:4px}
.sub{font-size:14px;opacity:.75;margin-bottom:28px}
.stats{display:flex;gap:14px;flex-wrap:wrap}
.stat{background:rgba(255,255,255,.15);border-radius:12px;padding:12px 20px;text-align:center;min-width:80px}
.stat .n{font-size:24px;font-weight:800}.stat .l{font-size:10px;opacity:.7;text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
.content{padding:32px 48px}
.section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;padding-bottom:10px;border-bottom:2px solid #e2e8f0;margin:28px 0 16px}
.section-title:first-child{margin-top:0}
.type-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:8px}
.type-card{border-radius:12px;padding:14px 18px}
.type-name{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.type-big{font-size:28px;font-weight:800;line-height:1}
.type-of{font-size:16px;font-weight:500;opacity:.55}
.type-sub{font-size:11px;margin-top:4px;opacity:.65}
.day-block{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:12px;page-break-inside:avoid}
.day-header{background:#f8fafc;padding:9px 16px;font-weight:600;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between}
.day-count{font-size:11px;background:#e2e8f0;padding:2px 10px;border-radius:999px;color:#64748b;font-weight:600}
.meal-row{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #f1f5f9}
.meal-row:last-child{border-bottom:none}
.meal-row.booked{background:#f0fdf4}
.type-badge{padding:3px 10px;border-radius:6px;font-size:10px;font-weight:700;min-width:72px;text-align:center;white-space:nowrap}
.meal-name{flex:1;font-size:13px;font-weight:500}
.meal-time{font-size:11px;color:#94a3b8;white-space:nowrap;margin-right:4px}
.pill{font-size:10px;font-weight:700;padding:2px 9px;border-radius:999px;white-space:nowrap}
.booked-pill{background:#dcfce7;color:#166534}
.avail-pill{background:#f1f5f9;color:#94a3b8}
.empty{padding:64px 48px;text-align:center}
.empty-icon{font-size:48px;margin-bottom:16px}
.empty-title{font-size:18px;font-weight:700;color:#1e293b;margin-bottom:8px}
.empty-sub{font-size:14px;color:#64748b;line-height:1.6}
.footer{margin-top:24px;padding:16px 48px;background:#f1f5f9;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}
@media print{
  body{background:#fff}
  .cover,.type-card,.type-badge,.booked-pill,.avail-pill,.meal-row.booked{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
<script>window.onload=function(){setTimeout(function(){window.print()},400)}</script>
</head><body>
<div class="cover">
  <h1>${cfg.viewLabel}</h1>
  <div class="sub">${userName} &middot; ${cfg.periodLabel}</div>
  ${cfg.days.length > 0 ? `<div class="stats">${coverStats}</div>` : ""}
</div>
<div class="content">
  ${typeGrid ? `<div class="section-title">Meal Type Summary</div><div class="type-grid">${typeGrid}</div><div class="section-title">Schedule — All Meals &amp; Booking Status</div>` : cfg.days.length > 0 ? `<div class="section-title">Schedule</div>` : ""}
  ${dayBlocks}
</div>
<div class="footer">
  <span>NutraTenant &middot; Meal Service</span>
  <span>Generated ${generated}</span>
</div>
</body></html>`;

  // Blob URL → <a target="_blank"> avoids popup blockers in all modern browsers
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, target: "_blank", rel: "noopener" });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Keep URL alive long enough for print dialog, then release
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function exportScheduleCSV(
  bookedSlots: Set<string>,
  userName:    string,
  viewMode:    "month" | "week",
  selectedDay: number | null,
  monthIdx:    number,
  year:        number,
  weekStart:   number,
) {
  const cfg   = buildExportConfig(viewMode, selectedDay, monthIdx, year, weekStart);
  // Same columns as the template so the file can be re-imported
  const lines = ["Date,Day,Meal Type,Meal Name,Time,Status"];
  cfg.days.forEach(day => {
    day.meals.forEach(meal => {
      const status = bookedSlots.has(`${day.date}:${meal.type}`) ? "Booked" : "Available";
      lines.push(`${day.date},${day.dayName},${TYPE_CONFIG[meal.type].label},${meal.name},${SLOT_RANGE[meal.type].display},${status}`);
    });
  });
  // BOM makes Excel open UTF-8 CSVs correctly
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href:     url,
    download: `${cfg.filename}.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function downloadCSVTemplate() {
  // Identical header + column order to exportScheduleCSV so the same file can be
  // exported, edited, and re-imported without any format conversion.
  const HEADER = "Date,Day,Meal Type,Meal Name,Time,Status";

  const SAMPLE_SLOTS: Array<[number, MealType]> = [
    [22, "breakfast"], [22, "lunch"],  [22, "dinner"],
    [23, "lunch"],     [23, "snack"],
    [27, "breakfast"], [27, "lunch"],  [27, "dinner"],
  ];

  const rows = SAMPLE_SLOTS.map(([date, type]) => {
    const meal = DAY_MEALS[date]?.find(m => m.type === type);
    return `${date},${getDayName(date)},${TYPE_CONFIG[type].label},${meal?.name ?? ""},${SLOT_RANGE[type].display},Available`;
  });

  const blob = new Blob([[HEADER, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href: url, download: "meal-schedule-template.csv",
  });
  a.click(); URL.revokeObjectURL(url);
}

function parseImportCSV(text: string): string[] {
  const keys: string[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim() || /^(date|booked)/i.test(line)) continue;
    const parts    = line.split(",").map(s => s.trim());
    const dateStr  = parts[0].replace(/\D/g, "");
    const date     = parseInt(dateStr);
    if (isNaN(date) || date < 1 || date > 30) continue;
    const typeCol  = parts.length >= 4 ? parts[2] : parts[1]; // our CSV: date,day,type,name,time
    const type     = (Object.keys(TYPE_CONFIG) as MealType[]).find(
      t => TYPE_CONFIG[t].label.toLowerCase() === typeCol.toLowerCase() || t === typeCol.toLowerCase()
    );
    if (type) keys.push(`${date}:${type}`);
  }
  return [...new Set(keys)];
}

function parsePastedSchedule(text: string): string[] {
  const keys: string[] = [];
  let currentDate = 0;
  for (const line of text.split("\n")) {
    const dateMatch = line.match(/june\s+(\d+)/i);
    if (dateMatch) { currentDate = parseInt(dateMatch[1]); continue; }
    if (currentDate < 1 || currentDate > 30) continue;
    if (line.includes("•") || line.trim().startsWith("-")) {
      for (const type of Object.keys(TYPE_CONFIG) as MealType[]) {
        if (line.toLowerCase().includes(TYPE_CONFIG[type].label.toLowerCase())) {
          const key = `${currentDate}:${type}`;
          if (!keys.includes(key)) keys.push(key);
          break;
        }
      }
    }
  }
  return keys;
}

/* ── Animated number (count-up, no extra deps) ──────────────────────────── */

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur   = 900;
    const raf   = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display}</>;
}

/* ── Animation variants ──────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ── Calendar builder ────────────────────────────────────────────────────── */

function buildWeeks(month: number, year: number): DayCell[][] {
  const firstDOW      = new Date(year, month, 1).getDay();     // 0 = Sun
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const isJune2025    = month === 5 && year === 2025;

  const cells: DayCell[] = [];

  // Leading days from previous month (gray, not interactive)
  for (let i = firstDOW - 1; i >= 0; i--)
    cells.push({ date: prevMonthDays - i, meals: [], isCurrentMonth: false });

  // Days of the selected month — meals only exist for June 2025
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: d, meals: isJune2025 ? (DAY_MEALS[d] ?? []) : [], isCurrentMonth: true });

  // Trailing days to fill the last row
  let nextDay = 1;
  while (cells.length % 7 !== 0)
    cells.push({ date: nextDay++, meals: [], isCurrentMonth: false });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ── Shared modal shell ──────────────────────────────────────────────────── */

function Modal({ open, onClose, title, children, size = "lg" }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "lg" | "xl";
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${size === "xl" ? "max-w-2xl" : "max-w-lg"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <button type="button" onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Small shared pieces ─────────────────────────────────────────────────── */

function FilterPill({ label }: { label: string }) {
  return (
    <button type="button"
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
    >
      {label}<ChevronDown className="h-3 w-3 text-slate-400" />
    </button>
  );
}

/* Updated chip: shows type label + meal name */
function MealChip({ meal }: { meal: MealEntry }) {
  const { label, bg, text } = TYPE_CONFIG[meal.type];
  return (
    <div className={`rounded px-1.5 py-1 ${bg}`}>
      <p className={`text-[9px] font-bold uppercase tracking-wide ${text}`}>{label}</p>
      <p className="truncate text-[10px] font-medium text-slate-700 leading-tight">{meal.name}</p>
    </div>
  );
}

/* ── Month calendar grid ─────────────────────────────────────────────────── */

interface CalendarGridProps {
  today:       number;   // -1 when not viewing the real current month
  bookedSlots: Set<string>;
  onDayClick:  (date: number) => void;
  onQuickAdd:  (date: number) => void;
  weeks:       DayCell[][];
}

function CalendarGrid({ today, bookedSlots, onDayClick, onQuickAdd, weeks }: CalendarGridProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">{d}</div>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-slate-100">
            {week.map((cell, di) => {
              // today === -1 when not viewing the real current month, so this never fires then
              const isToday = cell.isCurrentMonth && cell.date === today;
              const hasMeals  = cell.isCurrentMonth && cell.meals.length > 0;
              const slotKeys  = cell.meals.map(m => `${cell.date}:${m.type}`);
              const booked    = slotKeys.filter(k => bookedSlots.has(k)).length;
              const allBooked = booked === slotKeys.length && slotKeys.length > 0;

              return (
                <div
                  key={di}
                  onClick={() => hasMeals && onDayClick(cell.date)}
                  className={`relative min-h-[108px] p-2 transition-colors
                    ${hasMeals ? "cursor-pointer" : ""}
                    ${!cell.isCurrentMonth ? "bg-slate-50/60"
                      : booked > 0 ? "bg-emerald-50/50 hover:bg-emerald-50"
                      : "hover:bg-slate-50/60"}`}
                >
                  {/* Date row */}
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                      ${!cell.isCurrentMonth ? "text-slate-300"
                        : isToday ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-700"}`}
                    >
                      {cell.date}
                    </span>

                    {/* Quick-add/remove all slots for this day */}
                    {hasMeals && (
                      <button
                        type="button"
                        title={allBooked ? "Remove all" : "Quick-add all meals"}
                        onClick={(e) => { e.stopPropagation(); onQuickAdd(cell.date); }}
                        className={`flex h-5 w-5 items-center justify-center rounded-full transition-all
                          ${allBooked
                            ? "bg-emerald-500 text-white hover:bg-red-400"
                            : "border border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50"}`}
                      >
                        {allBooked ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </button>
                    )}
                  </div>

                  {/* Booking badge */}
                  {booked > 0 && (
                    <div className="mb-1 flex items-center gap-1">
                      <CalendarDays className="h-2.5 w-2.5 text-emerald-600" />
                      <span className="text-[9px] font-semibold text-emerald-700">
                        {booked}/{slotKeys.length} booked
                      </span>
                    </div>
                  )}

                  {/* Meal chips with type label */}
                  <div className="flex flex-col gap-0.5">
                    {cell.meals.slice(0, 2).map((m) => (
                      <MealChip key={m.id} meal={m} />
                    ))}
                    {cell.meals.length > 2 && (
                      <span className="pl-1 text-[10px] text-slate-400">
                        +{cell.meals.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Single-day calendar view (Google Calendar style) ───────────────────── */

/* Event block rendered inside the time grid */
function CalendarEventBlock({
  meal, date, isBooked, userName, onToggle,
}: {
  meal: MealEntry; date: number; isBooked: boolean;
  userName: string; onToggle: (key: string) => void;
}) {
  const [attendeeOpen, setAttendeeOpen] = useState(false);
  const cfg       = TYPE_CONFIG[meal.type];
  const range     = SLOT_RANGE[meal.type];
  const slotKey   = `${date}:${meal.type}`;
  const attendees = getAttendees(date, meal.type);
  const durationH = range.endH - range.startH;
  const top       = (range.startH - START_HOUR) * HOUR_PX;
  const height    = durationH * HOUR_PX;
  // avatar preview: first 6 others (you shown separately if booked)
  const preview   = attendees.slice(0, 6);
  const overflow  = attendees.length - 6;

  return (
    <>
      <div
        style={{ top, height, left: 64, right: 0, borderLeftColor: cfg.color }}
        className={`absolute mx-2 overflow-hidden rounded-lg border-l-4 shadow-sm transition-shadow hover:shadow-md ${cfg.bg}`}
      >
        <div className="flex h-full flex-col p-3">
          {/* Top row: type badge + action */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.text}`}
                style={{ background: `${cfg.color}22` }}
              >
                {cfg.label}
              </span>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{meal.name}</p>
              <p className="text-[11px] text-slate-500">{range.display}</p>
            </div>

            <button
              type="button"
              onClick={() => onToggle(slotKey)}
              className={`mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all
                ${isBooked
                  ? "bg-emerald-500 text-white hover:bg-red-500"
                  : `border ${cfg.border} ${cfg.text} bg-white/70 hover:bg-white`}`}
            >
              {isBooked
                ? <><Check className="h-3 w-3" />You&apos;re in</>
                : <><Plus className="h-3 w-3" />Add me</>}
            </button>
          </div>

          {/* Attendee row — shown when block is tall enough */}
          {durationH >= 1 && (
            <button
              type="button"
              onClick={() => setAttendeeOpen(true)}
              className="mt-auto flex items-center gap-2 pt-2 text-left"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-1">
                {isBooked && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[8px] font-bold text-white ring-1 ring-emerald-300">
                    {initials(userName)}
                  </div>
                )}
                {preview.map(name => (
                  <div key={name} title={name}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${avatarColor(name)} text-[8px] font-bold text-white`}
                  >
                    {initials(name)}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold text-slate-500">
                    +{overflow}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-500 hover:text-slate-700">
                {attendees.length + (isBooked ? 1 : 0)} attendees
                {isBooked && <span className="ml-1 text-emerald-600">· incl. you</span>}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Attendee detail modal */}
      <Modal
        open={attendeeOpen}
        onClose={() => setAttendeeOpen(false)}
        title={`${cfg.label} · ${meal.name} — June ${date}`}
      >
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <span>{attendees.length + (isBooked ? 1 : 0)} attendees · {range.display}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBooked && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 py-1 pl-1.5 pr-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {initials(userName)}
              </div>
              <span className="text-xs font-semibold text-emerald-700">{userName} (you)</span>
            </div>
          )}
          {attendees.map(name => (
            <div key={name} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-3">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${avatarColor(name)} text-[10px] font-bold text-white`}>
                {initials(name)}
              </div>
              <span className="text-xs text-slate-600">{name}</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

interface DayViewProps {
  date:        number;
  isToday:     boolean;
  bookedSlots: Set<string>;
  onToggle:    (key: string) => void;
  onBack:      () => void;
  userName:    string;
  autoJoin:    Set<MealType>;
}

function DayView({ date, isToday, bookedSlots, onToggle, onBack, userName, autoJoin }: DayViewProps) {
  const meals       = DAY_MEALS[date] ?? [];
  const dayName     = getDayName(date);
  const bookedCount = meals.filter(m => bookedSlots.has(`${date}:${m.type}`)).length;

  /* Live "now" indicator — minutes offset from START_HOUR */
  const [nowPx, setNowPx] = useState<number | null>(null);
  useEffect(() => {
    if (!isToday) return;
    function tick() {
      const d   = new Date();
      const h   = d.getHours() + d.getMinutes() / 60;
      const top = (h - START_HOUR) * HOUR_PX;
      setNowPx(Math.max(0, Math.min(top, TOTAL_H)));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const eligible = autoJoin.size > 0 ? meals.filter(m => autoJoin.has(m.type)) : meals;
  function selectAll() { eligible.forEach(m => { const k = `${date}:${m.type}`; if (!bookedSlots.has(k)) onToggle(k); }); }
  function clearAll()  { meals.forEach(m => { const k = `${date}:${m.type}`; if  (bookedSlots.has(k)) onToggle(k); }); }
  const autoJoinLabels = [...autoJoin].map(t => TYPE_CONFIG[t].label).join(" & ");

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> June 2025
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isToday && <span className="mr-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">Today</span>}
              {dayName}, June {date}
            </h2>
            <p className="text-xs text-slate-400">{meals.length} meal slot{meals.length !== 1 ? "s" : ""} · {bookedCount} attending</p>
          </div>
        </div>

        {/* Compact multi-select in header */}
        {meals.length > 0 && (
          <div className="flex items-center gap-2">
            {meals.map(meal => {
              const cfg      = TYPE_CONFIG[meal.type];
              const isBooked = bookedSlots.has(`${date}:${meal.type}`);
              return (
                <button key={meal.type} type="button" onClick={() => onToggle(`${date}:${meal.type}`)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all
                    ${isBooked
                      ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-2 ${cfg.ring}`
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label}
                  {isBooked && <Check className="h-3 w-3" strokeWidth={2.5} />}
                </button>
              );
            })}
            <span className="text-slate-300">|</span>
            <button type="button" onClick={selectAll}
              title={autoJoin.size > 0 ? `Add: ${autoJoinLabels}` : "Add all meal types"}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              {autoJoin.size > 0 ? (
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Auto-join
                </>
              ) : "All"}
            </button>
            <button type="button" onClick={clearAll}  className="text-xs font-medium text-slate-400 hover:text-slate-600">None</button>
          </div>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <CalendarDays className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-400">No meals scheduled for this day</p>
        </div>
      ) : (
        /* ── Time grid ──────────────────────────────────────────────────── */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="relative" style={{ height: TOTAL_H }}>

            {/* Hour rows */}
            {HOURS.map((h) => (
              <div key={h} className="absolute inset-x-0 flex" style={{ top: (h - START_HOUR) * HOUR_PX }}>
                {/* Time label */}
                <div className="flex w-16 shrink-0 items-start justify-end pr-3 pt-0.5">
                  <span className="text-[10px] font-medium text-slate-400">{fmtHour(h)}</span>
                </div>
                {/* Horizontal rule */}
                <div className="flex-1 border-t border-slate-100" />
              </div>
            ))}

            {/* Half-hour tick lines */}
            {HOURS.map((h) => (
              <div key={`h-${h}`} className="absolute inset-x-0 flex"
                style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX / 2 }}
              >
                <div className="w-16 shrink-0" />
                <div className="flex-1 border-t border-slate-50" />
              </div>
            ))}

            {/* ── "Now" indicator ─────────────────────────────────────── */}
            {isToday && nowPx !== null && (
              <div className="pointer-events-none absolute inset-x-0 flex items-center z-20"
                style={{ top: nowPx }}
              >
                <div className="ml-14 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                <div className="flex-1 border-t-2 border-red-500" />
              </div>
            )}

            {/* ── Meal event blocks ──────────────────────────────────── */}
            {meals.map(meal => (
              <CalendarEventBlock
                key={meal.id}
                meal={meal}
                date={date}
                isBooked={bookedSlots.has(`${date}:${meal.type}`)}
                userName={userName}
                onToggle={onToggle}
              />
            ))}

          </div>
        </div>
      )}

      {/* Booked summary */}
      {bookedCount > 0 && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
          ✓ You&apos;re attending{" "}
          <strong>{meals.filter(m => bookedSlots.has(`${date}:${m.type}`)).map(m => TYPE_CONFIG[m.type].label).join(", ")}</strong>
          {" "}on {dayName}, June {date}
        </p>
      )}
    </div>
  );
}

/* ── Schedule Meal modal ─────────────────────────────────────────────────── */

function ScheduleMealModal({
  open, onClose, bookedSlots, onToggle,
}: {
  open: boolean; onClose: () => void;
  bookedSlots: Set<string>; onToggle: (key: string) => void;
}) {
  const [selDate, setSelDate] = useState(27);
  const [selType, setSelType] = useState<MealType>("lunch");
  const [notes,   setNotes]   = useState("");

  const slotKey   = `${selDate}:${selType}`;
  const isBooked  = bookedSlots.has(slotKey);
  const meal      = DAY_MEALS[selDate]?.find(m => m.type === selType);
  const cfg       = TYPE_CONFIG[selType];
  const attendees = meal ? getAttendees(selDate, selType).length : 0;

  return (
    <Modal open={open} onClose={onClose} title="Schedule a Meal">
      <div className="flex flex-col gap-4">

        {/* Date */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date</label>
          <select value={selDate} onChange={e => setSelDate(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>
                {getDayName(d)}, June {d}{(DAY_MEALS[d] ?? []).length === 0 ? " (no meals)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Meal type grid */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Meal Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TYPE_CONFIG) as MealType[]).map(type => {
              const c     = TYPE_CONFIG[type];
              const avail = !!(DAY_MEALS[selDate]?.find(m => m.type === type));
              const sel   = selType === type;
              return (
                <button key={type} type="button" onClick={() => setSelType(type)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all
                    ${sel ? `${c.bg} ${c.border} ring-2 ring-inset ${c.ring}` : "border-slate-200 hover:bg-slate-50"}
                    ${!avail ? "opacity-40" : ""}`}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${sel ? c.text : "text-slate-700"}`}>{c.label}</p>
                    <p className="text-[10px] text-slate-400">{SLOT_RANGE[type].display}</p>
                  </div>
                  {!avail && <span className="ml-auto text-[9px] text-slate-400">None</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal preview */}
        {meal ? (
          <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
            <p className={`mb-1 text-xs font-semibold ${cfg.text}`}>{cfg.label} · {SLOT_RANGE[selType].display}</p>
            <p className="text-base font-bold text-slate-900">{meal.name}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {getDayName(selDate)}, June {selDate} · {attendees} attending
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-700">No meal scheduled</p>
            <p className="mt-0.5 text-[11px] text-amber-600">
              No {cfg.label.toLowerCase()} on {getDayName(selDate)}, June {selDate}.
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Allergies, special requests…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action */}
        <button type="button" disabled={!meal}
          onClick={() => { if (meal) { onToggle(slotKey); onClose(); setNotes(""); } }}
          className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all
            ${!meal ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : isBooked ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
        >
          {!meal ? "No meal available on this date"
            : isBooked ? `Remove me from ${cfg.label}`
            : `Add me · ${cfg.label} on ${getDayName(selDate)}, Jun ${selDate}`}
        </button>
      </div>
    </Modal>
  );
}

/* ── Import CSV modal ────────────────────────────────────────────────────── */

function ImportCSVModal({
  open, onClose, onBulkAdd,
}: {
  open: boolean; onClose: () => void; onBulkAdd: (keys: string[]) => void;
}) {
  const [preview, setPreview] = useState<string[]>([]);
  const [err,     setErr]     = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const keys = parseImportCSV(ev.target?.result as string);
      if (keys.length === 0) {
        setErr("No valid slots found. Use the downloaded template — columns: Date, Day, Meal Type, Meal Name, Time, Status.");
        setPreview([]);
      } else { setErr(""); setPreview(keys); }
    };
    reader.readAsText(file);
  }

  function apply() { onBulkAdd(preview); onClose(); setPreview([]); setErr(""); }

  return (
    <Modal open={open} onClose={() => { onClose(); setPreview([]); setErr(""); }} title="Import Schedule from CSV">
      <div className="flex flex-col gap-4">

        {/* Template download + format preview */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-800">CSV format</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Same columns as the Export CSV file — edit and re-import</p>
            </div>
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download Template
            </button>
          </div>

          {/* Column header row preview */}
          <div className="grid grid-cols-6 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
            {["Date", "Day", "Meal Type", "Meal Name", "Time", "Status"].map(col => (
              <div key={col} className="px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {col}
              </div>
            ))}
          </div>

          {/* Sample rows */}
          {[
            [22, "breakfast"] as const,
            [22, "dinner"]    as const,
            [23, "lunch"]     as const,
            [27, "snack"]     as const,
          ].map(([date, type]) => {
            const meal = DAY_MEALS[date]?.find(m => m.type === type);
            const cfg  = TYPE_CONFIG[type];
            return (
              <div key={`${date}-${type}`} className="grid grid-cols-6 divide-x divide-slate-50 border-b border-slate-50 last:border-b-0">
                <div className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-600">{date}</div>
                <div className="px-2 py-1.5 text-center text-[10px] text-slate-500">{getDayName(date)}</div>
                <div className="px-2 py-1.5 text-center">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                </div>
                <div className="truncate px-2 py-1.5 text-[10px] text-slate-500">{meal?.name}</div>
                <div className="px-2 py-1.5 text-center text-[9px] text-slate-400">{SLOT_RANGE[type].display}</div>
                <div className="px-2 py-1.5 text-center text-[9px] text-slate-400">Available</div>
              </div>
            );
          })}
        </div>

        {/* Drop zone */}
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Upload className="h-6 w-6" />
          Click to upload CSV file
        </button>

        {err && <p className="text-xs text-red-500">{err}</p>}

        {/* Preview */}
        <AnimatePresence>
          {preview.length > 0 && (
            <motion.div key="preview" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <p className="mb-2 text-xs font-semibold text-slate-700">{preview.length} slot{preview.length !== 1 ? "s" : ""} found:</p>
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-50 rounded-xl border border-slate-100">
                {preview.map(key => {
                  const [d, t]  = key.split(":");
                  const date    = Number(d);
                  const type    = t as MealType;
                  const c       = TYPE_CONFIG[type];
                  const meal    = DAY_MEALS[date]?.find(m => m.type === type);
                  return (
                    <div key={key} className="flex items-center gap-2.5 px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${c.bg} ${c.text}`}>{c.label}</span>
                      <span className="text-xs text-slate-700">{getDayName(date)}, Jun {date}</span>
                      <span className="truncate text-xs text-slate-400">— {meal?.name ?? <span className="text-amber-500">no meal</span>}</span>
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={apply}
                className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add {preview.length} slot{preview.length !== 1 ? "s" : ""} to my schedule
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

/* ── Paste Schedule modal ────────────────────────────────────────────────── */

function PasteScheduleModal({
  open, onClose, onBulkAdd,
}: {
  open: boolean; onClose: () => void; onBulkAdd: (keys: string[]) => void;
}) {
  const [text,    setText]    = useState("");
  const [preview, setPreview] = useState<string[]>([]);

  function parse() { setPreview(parsePastedSchedule(text)); }
  function apply() { onBulkAdd(preview); onClose(); setText(""); setPreview([]); }

  return (
    <Modal open={open} onClose={() => { onClose(); setText(""); setPreview([]); }} title="Paste Schedule">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-slate-500">
          Paste the schedule text you copied from this page — the parser reads "June DD" headers
          and "• MealType:" bullet lines automatically.
        </p>

        <textarea value={text} onChange={e => { setText(e.target.value); setPreview([]); }} rows={6}
          placeholder={`Paste copied schedule here…\n\nExample:\nSunday, June 22\n  • Breakfast: Blueberry Muffin\n  • Dinner: Grilled Salmon`}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button type="button" onClick={parse} disabled={!text.trim()}
          className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ClipboardPaste className="mr-1.5 inline h-3.5 w-3.5" />
          Parse Schedule
        </button>

        <AnimatePresence>
          {preview.length > 0 && (
            <motion.div key="prev" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <p className="mb-2 text-xs font-semibold text-slate-700">{preview.length} slot{preview.length !== 1 ? "s" : ""} detected:</p>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 rounded-xl border border-slate-100">
                {preview.map(key => {
                  const [d, t] = key.split(":");
                  const date   = Number(d);
                  const type   = t as MealType;
                  const c      = TYPE_CONFIG[type];
                  const meal   = DAY_MEALS[date]?.find(m => m.type === type);
                  return (
                    <div key={key} className="flex items-center gap-2.5 px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${c.bg} ${c.text}`}>{c.label}</span>
                      <span className="text-xs text-slate-700">{getDayName(date)}, Jun {date}</span>
                      {meal && <span className="truncate text-xs text-slate-400">— {meal.name}</span>}
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={apply}
                className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add {preview.length} slot{preview.length !== 1 ? "s" : ""} to my schedule
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {text.trim() && preview.length === 0 && (
          <p className="text-center text-xs text-slate-400">Click "Parse Schedule" to detect meals</p>
        )}
      </div>
    </Modal>
  );
}

/* ── Quick-action modals ─────────────────────────────────────────────────── */

function BrowseMealsModal({
  open, onClose, bookedSlots, onToggle,
}: {
  open: boolean; onClose: () => void;
  bookedSlots: Set<string>; onToggle: (key: string) => void;
}) {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<MealType | "all">("all");

  const allMeals = useMemo(() =>
    (Object.entries(DAY_MEALS) as [string, MealEntry[]][])
      .flatMap(([d, meals]) => meals.map(m => ({ ...m, date: Number(d) })))
      .sort((a, b) => a.date - b.date),
    [],
  );

  const filtered = useMemo(() =>
    allMeals.filter(m =>
      (typeFilter === "all" || m.type === typeFilter) &&
      m.name.toLowerCase().includes(search.toLowerCase()),
    ),
    [allMeals, typeFilter, search],
  );

  return (
    <Modal open={open} onClose={onClose} title="Browse Meal Items — June 2025" size="xl">
      {/* Search + type tabs */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search meals…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "breakfast", "lunch", "dinner", "snack"] as const).map(t => {
            const cfg = t !== "all" ? TYPE_CONFIG[t] : null;
            return (
              <button key={t} type="button" onClick={() => setTypeFilter(t)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-all
                  ${typeFilter === t
                    ? t === "all"
                      ? "bg-slate-800 text-white"
                      : `${cfg!.bg} ${cfg!.text} ring-1 ring-inset ${cfg!.ring}`
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                {t === "all" ? `All (${allMeals.length})` : `${cfg!.label}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal rows */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">No meals match your search.</div>
        )}
        {filtered.map(m => {
          const cfg      = TYPE_CONFIG[m.type];
          const slotKey  = `${m.date}:${m.type}`;
          const isBooked = bookedSlots.has(slotKey);
          const rng      = SLOT_RANGE[m.type];
          const count    = getAttendees(m.date, m.type).length;
          return (
            <div key={m.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all
                ${isBooked ? `${cfg.bg} ${cfg.border}` : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
            >
              {/* Type colour dot */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${cfg.color}1a` }}>
                <span className="h-3 w-3 rounded-full" style={{ background: cfg.color }} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                  <span className="text-[10px] text-slate-400">{getDayName(m.date)}, Jun {m.date}</span>
                  <span className="text-[10px] text-slate-400">{rng.display}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <Users className="h-2.5 w-2.5" />{count} attending
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <button type="button" onClick={() => onToggle(slotKey)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all
                  ${isBooked
                    ? "bg-emerald-500 text-white hover:bg-red-500"
                    : `border ${cfg.border} ${cfg.text} bg-white hover:${cfg.bg}`}`}
              >
                {isBooked
                  ? <><Check className="h-3 w-3" />You&apos;re in</>
                  : <><Plus  className="h-3 w-3" />Add me</>}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ── Settings modal ──────────────────────────────────────────────────────── */

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Dairy-free", "Nut-free",
  "Gluten-free", "Halal", "Kosher", "Low-sodium",
] as const;

function SettingsModal({
  open, onClose, autoJoin, onAutoJoinChange,
}: {
  open: boolean; onClose: () => void;
  autoJoin: Set<MealType>; onAutoJoinChange: (v: Set<MealType>) => void;
}) {
  const [dietary,       setDietary]       = useState<Set<string>>(new Set());
  const [emailReminder, setEmailReminder] = useState(true);
  const [pushReminder,  setPushReminder]  = useState(false);
  const [reminderMins,  setReminderMins]  = useState("30");
  const [defaultView,   setDefaultView]   = useState<"month" | "week">("month");

  function toggleDietary(d: string) {
    setDietary(prev => { const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n; });
  }
  function toggleAutoJoin(t: MealType) {
    const n = new Set(autoJoin); n.has(t) ? n.delete(t) : n.add(t); onAutoJoinChange(n);
  }

  return (
    <Modal open={open} onClose={onClose} title="Meal Service Settings">
      <div className="flex flex-col gap-6">

        {/* ── Dietary preferences ──────────────────────────────────────── */}
        <section>
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Dietary Preferences
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(d => (
              <button key={d} type="button" onClick={() => toggleDietary(d)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all
                  ${dietary.has(d)
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {dietary.has(d) && <Check className="h-3 w-3" />}
                {d}
              </button>
            ))}
          </div>
          {dietary.size > 0 && (
            <p className="mt-2 text-[10px] text-slate-400">
              {dietary.size} preference{dietary.size !== 1 ? "s" : ""} selected — the kitchen will be notified
            </p>
          )}
        </section>

        {/* ── Notifications ────────────────────────────────────────────── */}
        <section>
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </p>
          <div className="flex flex-col gap-2">
            {([
              { label: "Email reminders",   value: emailReminder, set: setEmailReminder },
              { label: "Push notifications", value: pushReminder,  set: setPushReminder  },
            ] as const).map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-700">{label}</span>
                <button type="button" onClick={() => set(!value)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all
                    ${value ? "left-4" : "left-0.5"}`} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-700">Remind me before meal</span>
              <select value={reminderMins} onChange={e => setReminderMins(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Auto-join ────────────────────────────────────────────────── */}
        <section>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Auto-join Meal Types
          </p>
          <p className="mb-2.5 text-[11px] text-slate-400">
            When active, "Add all" / quick-add on the calendar only adds the selected types.
            Leave all off to add every available meal type.
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_CONFIG) as MealType[]).map(type => {
              const { label, bg, text, border, ring } = TYPE_CONFIG[type];
              const active = autoJoin.has(type);
              return (
                <button key={type} type="button" onClick={() => toggleAutoJoin(type)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all
                    ${active ? `${bg} ${text} ${border} ring-1 ring-inset ${ring}` : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Default calendar view ─────────────────────────────────────── */}
        <section>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Default Calendar View
          </p>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["month", "week"] as const).map(v => (
              <button key={v} type="button" onClick={() => setDefaultView(v)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all
                  ${defaultView === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        {/* Save */}
        <button type="button" onClick={onClose}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Save Settings
        </button>
      </div>
    </Modal>
  );
}

/* ── Week view ───────────────────────────────────────────────────────────── */

function WeekEventBlock({
  meal, date, colIdx, isBooked, onToggle,
}: {
  meal: MealEntry; date: number; colIdx: number;
  isBooked: boolean; onToggle: (key: string) => void;
}) {
  const cfg       = TYPE_CONFIG[meal.type];
  const range     = SLOT_RANGE[meal.type];
  const slotKey   = `${date}:${meal.type}`;
  const durationH = range.endH - range.startH;
  const compact   = durationH < 2; // 1-hour blocks (e.g. Snacks 3–4 PM = 56px)

  return (
    <button
      type="button"
      title={`${cfg.label}: ${meal.name} — ${isBooked ? "click to remove" : "click to add yourself"}`}
      onClick={() => onToggle(slotKey)}
      style={{
        top:    (range.startH - START_HOUR) * HOUR_PX,
        height: durationH * HOUR_PX - 3,
        left:   `calc(64px + (100% - 68px) * ${colIdx} / 7 + 2px)`,
        width:  `calc((100% - 68px) / 7 - 2px)`,
        borderLeftColor: cfg.color,
      }}
      className={`absolute overflow-hidden rounded-md border-l-[3px] text-left transition-all
        ${compact ? "px-1.5 py-1" : "p-1.5"}
        ${cfg.bg}
        ${isBooked
          ? "ring-2 ring-inset ring-emerald-400/70 shadow-sm"
          : "opacity-80 hover:opacity-100 hover:shadow-sm"}`}
    >
      {compact ? (
        /* ── 1-hour compact: type badge + state icon on one row, name below ── */
        <>
          <div className="flex items-center justify-between gap-0.5">
            <p className={`text-[9px] font-bold leading-none ${cfg.text}`}>{cfg.short}</p>
            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-white
              ${isBooked ? "bg-emerald-500" : "bg-slate-400/50"}`}>
              {isBooked
                ? <Check className="h-2 w-2" />
                : <Plus  className="h-2 w-2" />}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[9px] leading-tight text-slate-700">{meal.name}</p>
        </>
      ) : (
        /* ── 2-hour standard: stacked with add/remove badge ────────────────── */
        <>
          <p className={`text-[9px] font-bold leading-none ${cfg.text}`}>{cfg.short}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-slate-700">{meal.name}</p>
          <span className={`mt-1 inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold
            ${isBooked ? "bg-emerald-500 text-white" : `bg-white/70 ${cfg.text}`}`}>
            {isBooked
              ? <><Check className="h-2.5 w-2.5" />In</>
              : <><Plus  className="h-2.5 w-2.5" />Add</>}
          </span>
        </>
      )}
    </button>
  );
}

function WeekView({
  weekStart, isToday, bookedSlots, onToggle, onDayClick,
}: {
  weekStart:   number;
  isToday:     (d: number) => boolean;
  bookedSlots: Set<string>;
  onToggle:    (key: string) => void;
  onDayClick:  (date: number) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = weekStart + i;
    return { date, dayLabel: DAYS_OF_WEEK[i], inMonth: date >= 1 && date <= 30 };
  });

  // Scroll to 7 AM on mount / week change
  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = (7 - START_HOUR) * HOUR_PX;
  }, [weekStart]);

  // "Now" indicator — only if this week contains today
  const [nowPx, setNowPx] = useState<number | null>(null);
  const todayColIdx = weekDays.findIndex(d => d.inMonth && isToday(d.date));
  useEffect(() => {
    if (todayColIdx < 0) { setNowPx(null); return; }
    function tick() {
      const t = new Date();
      setNowPx((t.getHours() + t.getMinutes() / 60 - START_HOUR) * HOUR_PX);
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [todayColIdx]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Day column headers */}
      <div className="grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
        <div className="border-r border-slate-100" />
        {weekDays.map(({ date, dayLabel, inMonth }, i) => {
          const today = inMonth && isToday(date);
          // Display number: dates >30 are next-month days (Jul 1, 2…)
          const display = date > 30 ? date - 30 : date < 1 ? 31 + date : date;
          return (
            <div key={i}
              onClick={() => inMonth && onDayClick(date)}
              className={`cursor-pointer border-r border-slate-100 px-1 py-3 text-center last:border-r-0 transition-colors
                ${today ? "bg-indigo-50" : "hover:bg-slate-100"}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{dayLabel}</p>
              <p className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold
                ${!inMonth ? "text-slate-300"
                  : today   ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-800"}`}>
                {display}
              </p>
              {!inMonth && (
                <p className="text-[8px] text-slate-300">{date > 30 ? "Jul" : "May"}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable time + event grid */}
      <div ref={gridRef} className="relative overflow-y-auto" style={{ height: Math.min(TOTAL_H, 560) }}>
        {/* Alternating row backgrounds */}
        {HOURS.map((h, i) => (
          <div key={h} className={`absolute inset-x-0 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
            style={{ top: (h - START_HOUR) * HOUR_PX, height: HOUR_PX }}
          />
        ))}

        {/* Hour labels + lines */}
        {HOURS.map(h => (
          <div key={h} className="absolute inset-x-0 flex pointer-events-none" style={{ top: (h - START_HOUR) * HOUR_PX }}>
            <div className="flex w-16 shrink-0 items-start justify-end pr-3 pt-0.5">
              <span className="text-[10px] font-medium text-slate-400">{fmtHour(h)}</span>
            </div>
            <div className="flex-1 border-t border-slate-100" />
          </div>
        ))}

        {/* Column dividers */}
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="pointer-events-none absolute top-0 bottom-0 border-r border-slate-100"
            style={{ left: `calc(64px + (100% - 64px) * ${i + 1} / 7)` }}
          />
        ))}

        {/* Today column highlight */}
        {todayColIdx >= 0 && (
          <div className="pointer-events-none absolute top-0 bottom-0 bg-indigo-50/25"
            style={{
              left:  `calc(64px + (100% - 68px) * ${todayColIdx} / 7)`,
              width: `calc((100% - 68px) / 7)`,
            }}
          />
        )}

        {/* "Now" red line */}
        {nowPx !== null && todayColIdx >= 0 && (
          <div className="pointer-events-none absolute z-20 flex items-center"
            style={{
              top:   nowPx,
              left:  `calc(64px + (100% - 68px) * ${todayColIdx} / 7 - 4px)`,
              right: `calc((100% - 68px) * ${6 - todayColIdx} / 7)`,
            }}
          >
            <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            <div className="flex-1 border-t-2 border-red-500" />
          </div>
        )}

        {/* Event blocks */}
        {weekDays.map(({ date, inMonth }, colIdx) => {
          if (!inMonth) return null;
          return (DAY_MEALS[date] ?? []).map(meal => (
            <WeekEventBlock
              key={`${date}-${meal.type}`}
              meal={meal}
              date={date}
              colIdx={colIdx}
              isBooked={bookedSlots.has(`${date}:${meal.type}`)}
              onToggle={onToggle}
            />
          ));
        })}
      </div>
    </div>
  );
}

/* ── Right sidebar ───────────────────────────────────────────────────────── */

interface RightPanelProps {
  bookedSlots:      Set<string>;
  onRemoveDay:      (date: number) => void;
  onToggleSlot:     (key: string) => void;
  onBulkAdd:        (keys: string[]) => void;
  userName:         string;
  autoJoin:         Set<MealType>;
  onAutoJoinChange: (v: Set<MealType>) => void;
}

function RightPanel({ bookedSlots, onRemoveDay, onToggleSlot, onBulkAdd, userName, autoJoin, onAutoJoinChange }: RightPanelProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [browseOpen,   setBrowseOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen,   setImportOpen]   = useState(false);
  const [pasteOpen,    setPasteOpen]    = useState(false);
  const [copied,       setCopied]       = useState(false);

  function copySchedule() {
    // Group booked slots by date (re-compute inline so this fn needs no deps)
    const map = new Map<number, MealType[]>();
    bookedSlots.forEach(key => {
      const [d, t] = key.split(":");
      const date = Number(d);
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(t as MealType);
    });
    if (map.size === 0) return;

    const lines: string[] = [
      `Meal Schedule — June 2025`,
      `Booked by: ${userName}`,
      `Exported: ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}`,
      "",
    ];
    [...map.entries()].sort((a, b) => a[0] - b[0]).forEach(([date, types]) => {
      lines.push(`${getDayName(date)}, June ${date}`);
      [...types]
        .sort((a, b) => SLOT_RANGE[a].startH - SLOT_RANGE[b].startH)
        .forEach(type => {
          const meal = DAY_MEALS[date]?.find(m => m.type === type);
          const rng  = SLOT_RANGE[type];
          lines.push(`  • ${TYPE_CONFIG[type].label}: ${meal?.name ?? "–"} (${rng.display})`);
        });
      lines.push("");
    });

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Group booked slots by date
  const byDay = useMemo(() => {
    const map = new Map<number, MealType[]>();
    bookedSlots.forEach((key) => {
      const [d, t] = key.split(":");
      const date = Number(d);
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(t as MealType);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [bookedSlots]);

  return (
    <>
    {/* ── Full Schedule Modal ─────────────────────────────────────────── */}
    <Modal
      open={scheduleOpen}
      onClose={() => setScheduleOpen(false)}
      title={`My Meal Schedule — June 2025 · ${userName}`}
    >
      {byDay.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CalendarDays className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">No meals booked yet. Click any day on the calendar to add yourself.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {byDay.map(([date]) => {
            const allSlots   = DAY_MEALS[date] ?? [];
            const slotsSorted = [...allSlots].sort((a, b) => SLOT_RANGE[a.type].startH - SLOT_RANGE[b.type].startH);
            const allKeys    = allSlots.map(m => `${date}:${m.type}`);
            const bookedKeys = allKeys.filter(k => bookedSlots.has(k));
            const allIn      = bookedKeys.length === allKeys.length;

            const eligibleKeys = autoJoin.size > 0
              ? allKeys.filter(k => autoJoin.has(k.split(":")[1] as MealType))
              : allKeys;
            function addAll()    { eligibleKeys.forEach(k => { if (!bookedSlots.has(k)) onToggleSlot(k); }); }
            function removeAll() { allKeys.forEach(k => { if  (bookedSlots.has(k)) onToggleSlot(k); }); }

            return (
              <div key={date} className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                {/* Day header */}
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                    <span className="text-[9px] font-bold uppercase leading-none opacity-70">Jun</span>
                    <span className="text-sm font-bold leading-none">{date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{getDayName(date)}, June {date}</p>
                    <p className="text-[11px] text-slate-400">
                      {bookedKeys.length}/{allKeys.length} meal{allKeys.length !== 1 ? "s" : ""} booked
                    </p>
                  </div>
                  {/* Per-day bulk actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {eligibleKeys.some(k => !bookedSlots.has(k)) && (
                      <button type="button" onClick={addAll}
                        title={autoJoin.size > 0 ? `Add: ${[...autoJoin].map(t => TYPE_CONFIG[t].label).join(" & ")}` : "Add all"}
                        className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                      >
                        <Plus className="h-3 w-3" />
                        {autoJoin.size > 0 ? "Auto-join" : "All"}
                      </button>
                    )}
                    {bookedKeys.length > 0 && (
                      <button type="button" onClick={removeAll}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 transition-colors hover:bg-red-100"
                      >
                        <X className="h-3 w-3" /> Remove all
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-slot rows — shows ALL meal slots for this day */}
                <div className="divide-y divide-slate-50">
                  {slotsSorted.map(meal => {
                    const cfg      = TYPE_CONFIG[meal.type];
                    const rng      = SLOT_RANGE[meal.type];
                    const slotKey  = `${date}:${meal.type}`;
                    const isBooked = bookedSlots.has(slotKey);
                    return (
                      <div key={meal.type}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isBooked ? `${cfg.bg}` : "bg-white hover:bg-slate-50"}`}
                      >
                        {/* Type indicator */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${cfg.color}18` }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: cfg.color }} />
                        </div>

                        {/* Meal info */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</p>
                          <p className="truncate text-[11px] text-slate-600">{meal.name}</p>
                          <p className="text-[10px] text-slate-400">{rng.display}</p>
                        </div>

                        {/* Per-slot toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleSlot(slotKey)}
                          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all
                            ${isBooked
                              ? "bg-emerald-500 text-white hover:bg-red-500"
                              : `border ${cfg.border} ${cfg.text} bg-white hover:${cfg.bg}`}`}
                        >
                          {isBooked
                            ? <><Check className="h-3 w-3" />You&apos;re in</>
                            : <><Plus className="h-3 w-3" />Add me</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>

    <aside className="flex w-64 shrink-0 flex-col gap-4">
      {/* Calendar Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-slate-900">Calendar Overview</p>
        <div className="flex flex-col gap-2">
          {[
            { label:"Meals Planned",  value:"248",                cls:"text-slate-900"   },
            { label:"This Week",      value:"42",                 cls:"text-slate-900"   },
            { label:"Locations",      value:"8",                  cls:"text-slate-900"   },
            { label:"Completion",     value:"94%",                cls:"text-emerald-600" },
            { label:"Your Bookings",  value:String(bookedSlots.size), cls: bookedSlots.size > 0 ? "text-emerald-600" : "text-slate-900" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <span className={`text-xs font-semibold ${cls}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My Schedule */}
      <AnimatePresence>
        {byDay.length > 0 && (
          <motion.div
            key="my-schedule"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-900">My Schedule</p>
              <button type="button" onClick={() => setScheduleOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
              >
                <CalendarDays className="h-3 w-3" /> View all
              </button>
            </div>
            <motion.div className="flex flex-col gap-2" variants={stagger} initial="hidden" animate="show">
              <AnimatePresence>
                {byDay.map(([date, types]) => (
                  <motion.div key={date} variants={fadeUp} exit={{ opacity:0, x:-10 }}
                    className="rounded-lg bg-white p-2.5 shadow-sm"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 flex-col items-center justify-center rounded-lg bg-emerald-100">
                          <span className="text-[8px] font-bold uppercase text-emerald-600">Jun</span>
                          <span className="text-xs font-bold text-emerald-800">{date}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">{getDayName(date)}</span>
                      </div>
                      <button type="button" onClick={() => onRemoveDay(date)}
                        className="text-slate-300 transition-colors hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {types.sort().map(t => {
                        const { label, bg, text } = TYPE_CONFIG[t];
                        return <span key={t} className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${bg} ${text}`}>{label}</span>;
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p className="mb-3 text-sm font-semibold text-slate-900">Meal Type Distribution</p>
        <div className="relative flex items-center justify-center">
          <div className="h-36 w-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DISTRIBUTION} cx="50%" cy="50%" innerRadius={44} outerRadius={64} dataKey="value" paddingAngle={2}>
                  {DISTRIBUTION.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize:11, borderRadius:8, border:"1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-slate-900"><AnimatedNumber value={TOTAL_MEALS} /></p>
              <p className="text-[10px] text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <motion.div className="mt-3 flex flex-col gap-2.5" variants={stagger} initial="hidden" animate="show">
          {DISTRIBUTION.map(d => (
            <motion.div key={d.name} variants={fadeUp} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-500">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-900"><AnimatedNumber value={d.value} /></span>
              </div>
              {/* Animated progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.value / TOTAL_MEALS) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                  style={{ background: d.color }}
                  className="h-full rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Upcoming Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p className="mb-3 text-sm font-semibold text-slate-900">Upcoming Highlights</p>
        <motion.div className="flex flex-col gap-2.5" variants={stagger} initial="hidden" animate="show">
          {UPCOMING.map((u) => {
            const { label, bg, text } = TYPE_CONFIG[u.type];
            return (
              <motion.div key={u.title} variants={fadeUp} className="flex items-center gap-2.5">
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${bg} ${text}`}>{label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-700">{u.title}</span>
                <span className="shrink-0 text-[9px] text-slate-400">{u.date}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:0.25 }}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
          {autoJoin.size > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Auto-join: {[...autoJoin].map(t => TYPE_CONFIG[t].label).join(", ")}
            </span>
          )}
        </div>
        <motion.div className="flex flex-col gap-0.5" variants={stagger} initial="hidden" animate="show">

          {/* Browse Meal Items */}
          <motion.button variants={fadeUp} type="button" onClick={() => setBrowseOpen(true)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            Browse Meal Items
            <span className="ml-auto text-[10px] text-slate-400">{Object.values(DAY_MEALS).flat().length} meals</span>
          </motion.button>

          {/* Copy Schedule */}
          <motion.button variants={fadeUp} type="button" onClick={copySchedule}
            disabled={bookedSlots.size === 0}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors
              ${copied
                ? "bg-emerald-50 text-emerald-700"
                : bookedSlots.size === 0
                  ? "cursor-not-allowed text-slate-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            {copied
              ? <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              : <Copy           className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            {copied ? "Copied to clipboard!" : "Copy My Schedule"}
            {!copied && bookedSlots.size > 0 && (
              <span className="ml-auto text-[10px] text-slate-400">{bookedSlots.size} slot{bookedSlots.size !== 1 ? "s" : ""}</span>
            )}
          </motion.button>

          {/* Import CSV */}
          <motion.button variants={fadeUp} type="button" onClick={() => setImportOpen(true)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <Upload className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Import from CSV
          </motion.button>

          {/* Paste Schedule */}
          <motion.button variants={fadeUp} type="button" onClick={() => setPasteOpen(true)}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors
              ${copied ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            <ClipboardPaste className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Paste Schedule
            {copied && <span className="ml-auto text-[10px] text-emerald-500">paste what you copied</span>}
          </motion.button>

          {/* Manage Settings */}
          <motion.button variants={fadeUp} type="button" onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <Settings className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            Manage Settings
            {autoJoin.size > 0 && <span className="ml-auto text-[10px] text-indigo-400">auto-join on</span>}
          </motion.button>

        </motion.div>
      </motion.div>
    </aside>

    {/* ── Quick-action modals ──────────────────────────────────────────── */}
    <BrowseMealsModal
      open={browseOpen}
      onClose={() => setBrowseOpen(false)}
      bookedSlots={bookedSlots}
      onToggle={onToggleSlot}
    />
    <SettingsModal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      autoJoin={autoJoin}
      onAutoJoinChange={onAutoJoinChange}
    />
    <ImportCSVModal
      open={importOpen}
      onClose={() => setImportOpen(false)}
      onBulkAdd={onBulkAdd}
    />
    <PasteScheduleModal
      open={pasteOpen}
      onClose={() => setPasteOpen(false)}
      onBulkAdd={onBulkAdd}
    />
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function MealCalendarPage() {
  const { currentUser }               = usePreviewUser();
  const [monthIdx, setMonthIdx]       = useState(REAL_MONTH);
  const [year,     setYear]           = useState(REAL_YEAR);
  const [bookedSlots, setBooked]      = useState<Set<string>>(new Set());
  const [selectedDay, setSelected]    = useState<number | null>(null);
  const [viewMode, setViewMode]       = useState<"month" | "week">("month");
  const [weekOffset, setWeekOffset]   = useState(0);
  const [autoJoin,         setAutoJoin]          = useState<Set<MealType>>(new Set());
  const [scheduleMealOpen, setScheduleMealOpen] = useState(false);
  const [exportDropOpen,   setExportDropOpen]   = useState(false);
  const exportRef                               = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setExportDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleSlot(key: string) {
    setBooked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function quickAddDay(date: number) {
    const meals    = DAY_MEALS[date] ?? [];
    // Respect auto-join filter: if types are selected, only add those
    const eligible = autoJoin.size > 0 ? meals.filter(m => autoJoin.has(m.type)) : meals;
    const allKeys  = eligible.map(m => `${date}:${m.type}`);
    if (allKeys.length === 0) return;
    setBooked((prev) => {
      const next  = new Set(prev);
      const allIn = allKeys.every(k => next.has(k));
      allKeys.forEach(k => allIn ? next.delete(k) : next.add(k));
      return next;
    });
  }

  function addBulkSlots(keys: string[]) {
    setBooked(prev => { const n = new Set(prev); keys.forEach(k => n.add(k)); return n; });
  }

  function removeAllForDay(date: number) {
    setBooked((prev) => {
      const next = new Set(prev);
      [...next].filter(k => k.startsWith(`${date}:`)).forEach(k => next.delete(k));
      return next;
    });
  }

  function prev() {
    setSelected(null);
    if (monthIdx === 0) { setMonthIdx(11); setYear(y => y - 1); }
    else setMonthIdx(m => m - 1);
  }
  function next() {
    setSelected(null);
    if (monthIdx === 11) { setMonthIdx(0); setYear(y => y + 1); }
    else setMonthIdx(m => m + 1);
  }
  function goToday() {
    if (viewMode === "week") { setWeekOffset(0); return; }
    setSelected(null);
    setMonthIdx(REAL_MONTH);
    setYear(REAL_YEAR);
  }

  const isJune2025       = monthIdx === 5 && year === 2025;
  const isViewingToday   = monthIdx === REAL_MONTH && year === REAL_YEAR;
  const today            = isViewingToday ? REAL_DATE : -1;
  const weeks            = useMemo(() => buildWeeks(monthIdx, year), [monthIdx, year]);
  const weekStart        = weekStartForOffset(weekOffset);
  const isToday          = (d: number) => d === TODAY_DATE;

  // Label shown in the Export dropdown to reflect the currently visible period
  const exportPeriodLabel = useMemo(() => {
    if (selectedDay !== null) return `${MONTHS[monthIdx].slice(0, 3)} ${selectedDay}`;
    if (viewMode === "week") return weekRangeLabel(weekStart);
    return `${MONTHS[monthIdx]} ${year}`;
  }, [selectedDay, viewMode, monthIdx, year, weekStart]);

  return (
    <>
    <div className="flex gap-5">
      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Meal Calendar</h1>
            <p className="mt-0.5 text-sm text-slate-500">Click any day to view meal slots and manage attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
              Viewing as <strong className="ml-1 text-slate-800">{currentUser.name}</strong>
            </span>

            {/* Export dropdown */}
            <div ref={exportRef} className="relative">
              <button type="button"
                onClick={() => setExportDropOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {exportDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    <button type="button"
                      onClick={() => { exportToPDF(bookedSlots, currentUser.name, viewMode, selectedDay, monthIdx, year, weekStart); setExportDropOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium">Export as PDF</span>
                        <span className="text-[10px] text-slate-400">{exportPeriodLabel}</span>
                      </div>
                    </button>
                    <button type="button"
                      onClick={() => { exportScheduleCSV(bookedSlots, currentUser.name, viewMode, selectedDay, monthIdx, year, weekStart); setExportDropOpen(false); }}
                      className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <FileDown className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium">Export as CSV</span>
                        <span className="text-[10px] text-slate-400">{exportPeriodLabel}</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="button"
              onClick={() => setScheduleMealOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <Plus className="h-4 w-4" /> Schedule Meal
            </button>
          </div>
        </div>

        {selectedDay === null ? (
          <>
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill label="All Locations"  />
              <FilterPill label="All Meal Types" />
              <FilterPill label="All Meal Plans" />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  <strong className="text-slate-900">1,200</strong> meals
                </span>
                <button type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Filter className="h-3.5 w-3.5" /> Filters
                </button>
              </div>
            </div>

            {/* Navigation bar */}
            <div className="flex flex-wrap items-center gap-2">

              {/* View mode toggle */}
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                {(["month", "week"] as const).map(mode => (
                  <button key={mode} type="button"
                    onClick={() => setViewMode(mode)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all
                      ${viewMode === mode
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-slate-200" />

              {viewMode === "month" ? (
                <>
                  <button type="button" onClick={prev}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[130px] text-center text-sm font-semibold text-slate-900">
                    {MONTHS[monthIdx]} {year}
                  </span>
                  <button type="button" onClick={next}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setWeekOffset(o => o - 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                  </button>
                  <span className="min-w-[160px] text-center text-sm font-semibold text-slate-900">
                    {weekRangeLabel(weekStart)}
                  </span>
                  <button type="button" onClick={() => setWeekOffset(o => o + 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  {weekOffset !== 0 && (
                    <button type="button" onClick={() => setWeekOffset(0)}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      This Week
                    </button>
                  )}
                </>
              )}

              <button type="button" onClick={goToday}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Today
              </button>

              {viewMode === "month" && (
                <span className="ml-1 text-xs text-slate-400">
                  Click a day to open its meals · <kbd className="rounded border border-slate-200 px-1 py-0.5 text-[10px]">+</kbd> = quick-add all slots
                </span>
              )}
              {viewMode === "week" && (
                <span className="ml-1 text-xs text-slate-400">
                  Click any event to add/remove yourself · click a day header to open detail view
                </span>
              )}
            </div>

            {/* Calendar grid — month or week */}
            {viewMode === "month" ? (
              <CalendarGrid
                today={today}
                bookedSlots={bookedSlots}
                onDayClick={setSelected}
                onQuickAdd={quickAddDay}
                weeks={weeks}
              />
            ) : (
              <WeekView
                weekStart={weekStart}
                isToday={isToday}
                bookedSlots={bookedSlots}
                onToggle={toggleSlot}
                onDayClick={setSelected}
              />
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(TYPE_CONFIG).map(([, { label, color }]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background:color }} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <DayView
            date={selectedDay}
            isToday={selectedDay === today}
            bookedSlots={bookedSlots}
            onToggle={toggleSlot}
            onBack={() => setSelected(null)}
            userName={currentUser.name}
            autoJoin={autoJoin}
          />
        )}
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <RightPanel
        bookedSlots={bookedSlots}
        onRemoveDay={removeAllForDay}
        onToggleSlot={toggleSlot}
        onBulkAdd={addBulkSlots}
        userName={currentUser.name}
        autoJoin={autoJoin}
        onAutoJoinChange={setAutoJoin}
      />
    </div>

    {/* Page-level modals */}
    <ScheduleMealModal
      open={scheduleMealOpen}
      onClose={() => setScheduleMealOpen(false)}
      bookedSlots={bookedSlots}
      onToggle={toggleSlot}
    />
    </>
  );
}

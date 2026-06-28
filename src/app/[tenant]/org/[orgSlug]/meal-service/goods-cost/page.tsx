"use client";

import { useState, useRef, useCallback, Fragment, useEffect } from "react";
import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Upload, FileText, Trash2, Plus, CheckCircle2,
  HelpCircle, ChevronRight, Calculator, Lightbulb,
  Download, TableProperties, AlertCircle, Zap, Users, Calendar,
  X, ArrowLeft, Filter, Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SlideUp, SlideIn, Modal, SearchBox, TextField, AnimatedNumber } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface IngredientItem {
  id:              string;
  name:            string;
  emoji?:          string;
  date?:           string;
  qty:             string;
  unit:            string;
  unitPrice:       string;
  total:           string; // plain numeric string — no currency symbol
  purchaseQty?:    string;
  amountPaid?:     string;
  priceSource:     "direct" | "calculated";
  primary?:        string; // "Food & Dining" | "Transport & Logistics"
  sub?:            string; // "Grains & Staples" | "Proteins" | "Vegetables" | …
}

interface DailyUpload {
  id:       string;
  date:     string;           // YYYY-MM-DD
  filename: string;
  source:   "receipt" | "csv" | "manual";
  items:    IngredientItem[];
}

interface IngredientSuggestion {
  id:        string;
  name:      string;
  emoji:     string;
  primary:   string;
  sub:       string;
  tags:      string[];
  unit:      string;
  unitPrice: string; // typical BDT price, numeric string
  bg:        string; // Tailwind bg class
  isCustom?: boolean;
}

type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack";

/* ── Payment configuration (mirrors Settings → Payment → Default Currency) ── */
const PAYMENT_CONFIG = { code: "BDT", symbol: "৳" } as const;

/* ── Named constants ────────────────────────────────────────────────────── */
const PRIMARY_CAT_FOOD      = "Food & Dining"        as const;
const PRIMARY_CAT_TRANSPORT = "Transport & Logistics" as const;
const DEFAULT_SUB           = "Other"                 as const;
const FILTER_ALL            = "all"                   as const;

/* ── Framer Motion stagger variants for search results grid ─────────────── */
const SEARCH_GRID_VARIANTS = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
} as const;

const SEARCH_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

/** Format a number or numeric string with the payment currency symbol. */
function formatCurrency(n: number | string): string {
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
  { id:"i1",  name:"Chicken Breast",     qty:"2.5", unit:"kg",   unitPrice:"1.67",  total:"4.18",  purchaseQty:"3",   amountPaid:"5.00", priceSource:"calculated", primary:"Food & Dining",        sub:"Proteins"            },
  { id:"i2",  name:"Brown Rice",         qty:"1.0", unit:"kg",   unitPrice:"2.80",  total:"2.80",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Grains & Staples"    },
  { id:"i3",  name:"Mixed Vegetables",   qty:"1.5", unit:"kg",   unitPrice:"3.20",  total:"4.80",  purchaseQty:"2",   amountPaid:"6.40", priceSource:"calculated", primary:"Food & Dining",        sub:"Vegetables"          },
  { id:"i4",  name:"Olive Oil",          qty:"250", unit:"ml",   unitPrice:"0.012", total:"3.00",  purchaseQty:"250", amountPaid:"3.00", priceSource:"calculated", primary:"Food & Dining",        sub:"Oils & Fats"         },
  { id:"i5",  name:"Garlic",             qty:"50",  unit:"g",    unitPrice:"0.04",  total:"2.00",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Vegetables"          },
  { id:"i6",  name:"Lemon",              qty:"3",   unit:"pcs",  unitPrice:"0.50",  total:"1.50",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Fruits"              },
  { id:"i7",  name:"Herbs & Spices",     qty:"30",  unit:"g",    unitPrice:"0.20",  total:"6.00",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Spices & Herbs"      },
  { id:"i8",  name:"Quinoa",             qty:"500", unit:"g",    unitPrice:"0.012", total:"6.00",  purchaseQty:"500", amountPaid:"6.00", priceSource:"calculated", primary:"Food & Dining",        sub:"Grains & Staples"    },
  { id:"i9",  name:"Seasonal Greens",    qty:"800", unit:"g",    unitPrice:"0.004", total:"3.20",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Vegetables"          },
  { id:"i10", name:"Greek Yogurt",       qty:"500", unit:"ml",   unitPrice:"0.008", total:"4.00",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Dairy & Eggs"        },
  { id:"i11", name:"Almonds",            qty:"200", unit:"g",    unitPrice:"0.025", total:"5.00",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Nuts & Seeds"        },
  { id:"i12", name:"Feta Cheese",        qty:"250", unit:"g",    unitPrice:"0.028", total:"7.00",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Dairy & Eggs"        },
  { id:"i13", name:"Tomatoes",           qty:"1.0", unit:"kg",   unitPrice:"2.20",  total:"2.20",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Vegetables"          },
  { id:"i14", name:"Cucumber",           qty:"500", unit:"g",    unitPrice:"1.80",  total:"0.90",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Vegetables"          },
  { id:"i15", name:"Avocado",            qty:"4",   unit:"pcs",  unitPrice:"1.20",  total:"4.80",  priceSource:"direct",                                             primary:"Food & Dining",        sub:"Fruits"              },
  { id:"i16", name:"Transportation Cost", qty:"1",  unit:"trip", unitPrice:"30",    total:"30.00", priceSource:"direct",                                             primary:"Transport & Logistics", sub:"Transportation"      },
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

/* ── Category taxonomy ──────────────────────────────────────────────────── */
const CATEGORY_TAXONOMY: Record<string, Record<string, string[]>> = {
  "Food & Dining": {
    "Grains & Staples":    ["Rice","Brown Rice","White Rice","Dal","Lentils","Wheat Flour","Oats","Quinoa","Pasta","Bread","Noodle"],
    "Proteins":            ["Chicken","Chicken Breast","Beef","Lamb","Mutton","Fish","Egg","Eggs","Shrimp","Prawn","Tofu","Duck"],
    "Vegetables":          ["Tomato","Tomatoes","Onion","Garlic","Spinach","Carrot","Potato","Broccoli","Cucumber","Bell Pepper","Mushroom","Cabbage","Eggplant","Mixed Vegetables","Seasonal Greens","Pumpkin","Bean"],
    "Dairy & Eggs":        ["Milk","Butter","Cheese","Feta Cheese","Yogurt","Greek Yogurt","Cream","Paneer"],
    "Oils & Fats":         ["Olive Oil","Sunflower Oil","Coconut Oil","Mustard Oil","Vegetable Oil","Ghee"],
    "Fruits":              ["Banana","Apple","Lemon","Mango","Orange","Avocado","Strawberry","Grape","Pineapple","Watermelon"],
    "Spices & Herbs":      ["Turmeric","Cumin","Coriander","Chili Powder","Salt","Black Pepper","Ginger","Cinnamon","Cardamom","Bay Leaf","Herbs & Spices","Paprika","Oregano","Basil"],
    "Nuts & Seeds":        ["Almonds","Cashews","Sesame Seeds","Sunflower Seeds","Walnuts","Peanuts","Chia Seeds","Flax Seeds"],
    "Condiments & Sauces": ["Sugar","Honey","Soy Sauce","Tomato Sauce","Ketchup","Vinegar","Chili Sauce","Fish Sauce"],
  },
  "Transport & Logistics": {
    "Transportation": ["Transportation Cost","Transport Cost","Delivery Fee","Freight","Delivery Charge","Rickshaw","CNG"],
  },
};

function assignCategory(name: string): { primary: string; sub: string } | null {
  const n = name.toLowerCase().trim();
  for (const [primary, subs] of Object.entries(CATEGORY_TAXONOMY)) {
    for (const [sub, items] of Object.entries(subs)) {
      if (items.some(item => {
        const il = item.toLowerCase();
        return il === n || n.includes(il) || il.includes(n);
      })) {
        return { primary, sub };
      }
    }
  }
  if (n.includes("transport") || n.includes("deliver") || n.includes("freight")) {
    return { primary: PRIMARY_CAT_TRANSPORT, sub: "Transportation" };
  }
  return null;
}

/* ── Ingredient database (semantic search) ──────────────────────────────── */
const INGREDIENT_DB: IngredientSuggestion[] = [
  // Proteins
  { id:"ing-1",  name:"Chicken Breast",     emoji:"🍗", primary:"Food & Dining", sub:"Proteins",           tags:["poultry","meat","hen","broiler","murgi"],          unit:"kg",   unitPrice:"180", bg:"bg-orange-100" },
  { id:"ing-2",  name:"Beef",               emoji:"🥩", primary:"Food & Dining", sub:"Proteins",           tags:["meat","red meat","cow","goru","mangsho"],          unit:"kg",   unitPrice:"350", bg:"bg-red-100"    },
  { id:"ing-3",  name:"Fish",               emoji:"🐟", primary:"Food & Dining", sub:"Proteins",           tags:["seafood","salmon","tilapia","rui","katla","mach"], unit:"kg",   unitPrice:"200", bg:"bg-blue-100"   },
  { id:"ing-4",  name:"Eggs",               emoji:"🥚", primary:"Food & Dining", sub:"Proteins",           tags:["egg","dim","protein"],                             unit:"pcs",  unitPrice:"12",  bg:"bg-yellow-100" },
  { id:"ing-5",  name:"Shrimp",             emoji:"🦐", primary:"Food & Dining", sub:"Proteins",           tags:["seafood","prawn","chingri","shellfish"],           unit:"kg",   unitPrice:"450", bg:"bg-pink-100"   },
  { id:"ing-6",  name:"Tofu",               emoji:"🫘", primary:"Food & Dining", sub:"Proteins",           tags:["vegetarian","soy","protein","vegan"],              unit:"kg",   unitPrice:"120", bg:"bg-slate-100"  },
  { id:"ing-7",  name:"Lamb",               emoji:"🥩", primary:"Food & Dining", sub:"Proteins",           tags:["mutton","red meat","khashi","sheep","mangsho"],    unit:"kg",   unitPrice:"550", bg:"bg-amber-100"  },
  { id:"ing-8",  name:"Duck",               emoji:"🦆", primary:"Food & Dining", sub:"Proteins",           tags:["poultry","bird","hansh"],                          unit:"kg",   unitPrice:"280", bg:"bg-emerald-100"},
  // Vegetables
  { id:"ing-9",  name:"Tomato",             emoji:"🍅", primary:"Food & Dining", sub:"Vegetables",         tags:["red","salad","sauce","tomatoes"],                  unit:"kg",   unitPrice:"60",  bg:"bg-red-100"    },
  { id:"ing-10", name:"Onion",              emoji:"🧅", primary:"Food & Dining", sub:"Vegetables",         tags:["peyaj","bulb","allium"],                           unit:"kg",   unitPrice:"40",  bg:"bg-purple-100" },
  { id:"ing-11", name:"Garlic",             emoji:"🧄", primary:"Food & Dining", sub:"Vegetables",         tags:["rasun","allium","flavoring","spice"],              unit:"g",    unitPrice:"2",   bg:"bg-amber-100"  },
  { id:"ing-12", name:"Spinach",            emoji:"🥬", primary:"Food & Dining", sub:"Vegetables",         tags:["palak","leafy green","iron","saag"],               unit:"g",    unitPrice:"0.5", bg:"bg-green-100"  },
  { id:"ing-13", name:"Carrot",             emoji:"🥕", primary:"Food & Dining", sub:"Vegetables",         tags:["gajar","root","orange"],                           unit:"kg",   unitPrice:"50",  bg:"bg-orange-100" },
  { id:"ing-14", name:"Potato",             emoji:"🥔", primary:"Food & Dining", sub:"Vegetables",         tags:["aloo","starch","root","carb"],                     unit:"kg",   unitPrice:"30",  bg:"bg-stone-100"  },
  { id:"ing-15", name:"Broccoli",           emoji:"🥦", primary:"Food & Dining", sub:"Vegetables",         tags:["green","cruciferous","fiber"],                     unit:"kg",   unitPrice:"80",  bg:"bg-green-100"  },
  { id:"ing-16", name:"Cucumber",           emoji:"🥒", primary:"Food & Dining", sub:"Vegetables",         tags:["shesha","salad","cooling"],                        unit:"kg",   unitPrice:"40",  bg:"bg-green-100"  },
  { id:"ing-17", name:"Bell Pepper",        emoji:"🫑", primary:"Food & Dining", sub:"Vegetables",         tags:["capsicum","colorful","vitamin c"],                 unit:"pcs",  unitPrice:"30",  bg:"bg-red-100"    },
  { id:"ing-18", name:"Mushroom",           emoji:"🍄", primary:"Food & Dining", sub:"Vegetables",         tags:["fungi","umami","moshroom"],                        unit:"g",    unitPrice:"1.5", bg:"bg-stone-100"  },
  { id:"ing-19", name:"Cabbage",            emoji:"🥬", primary:"Food & Dining", sub:"Vegetables",         tags:["bandha kopi","leafy","coleslaw"],                  unit:"kg",   unitPrice:"25",  bg:"bg-green-100"  },
  { id:"ing-20", name:"Eggplant",           emoji:"🍆", primary:"Food & Dining", sub:"Vegetables",         tags:["brinjal","begun","aubergine","purple"],            unit:"kg",   unitPrice:"40",  bg:"bg-purple-100" },
  { id:"ing-21", name:"Mixed Vegetables",   emoji:"🥗", primary:"Food & Dining", sub:"Vegetables",         tags:["salad","mixed","assorted","sabji"],                unit:"kg",   unitPrice:"50",  bg:"bg-green-100"  },
  // Grains & Staples
  { id:"ing-22", name:"Brown Rice",         emoji:"🍚", primary:"Food & Dining", sub:"Grains & Staples",   tags:["rice","chawal","carb","wholegrain"],               unit:"kg",   unitPrice:"80",  bg:"bg-amber-100"  },
  { id:"ing-23", name:"White Rice",         emoji:"🍚", primary:"Food & Dining", sub:"Grains & Staples",   tags:["rice","chawal","carb","polished","chaler"],        unit:"kg",   unitPrice:"65",  bg:"bg-amber-50"   },
  { id:"ing-24", name:"Wheat Flour",        emoji:"🌾", primary:"Food & Dining", sub:"Grains & Staples",   tags:["atta","flour","bread","roti","baking"],            unit:"kg",   unitPrice:"45",  bg:"bg-yellow-100" },
  { id:"ing-25", name:"Oats",               emoji:"🌾", primary:"Food & Dining", sub:"Grains & Staples",   tags:["cereal","breakfast","fiber","porridge"],           unit:"g",    unitPrice:"0.5", bg:"bg-amber-100"  },
  { id:"ing-26", name:"Quinoa",             emoji:"🌾", primary:"Food & Dining", sub:"Grains & Staples",   tags:["superfood","protein grain","seed"],                unit:"g",    unitPrice:"1",   bg:"bg-lime-100"   },
  { id:"ing-27", name:"Pasta",              emoji:"🍝", primary:"Food & Dining", sub:"Grains & Staples",   tags:["noodle","italian","carb","macaroni"],              unit:"g",    unitPrice:"0.5", bg:"bg-yellow-100" },
  { id:"ing-28", name:"Bread",              emoji:"🍞", primary:"Food & Dining", sub:"Grains & Staples",   tags:["loaf","bakery","toast","pauruti"],                 unit:"pcs",  unitPrice:"40",  bg:"bg-amber-100"  },
  { id:"ing-29", name:"Lentils",            emoji:"🫘", primary:"Food & Dining", sub:"Grains & Staples",   tags:["dal","masoor","legume","protein","mung"],          unit:"g",    unitPrice:"0.3", bg:"bg-orange-100" },
  // Dairy & Eggs
  { id:"ing-30", name:"Milk",               emoji:"🥛", primary:"Food & Dining", sub:"Dairy & Eggs",       tags:["doodh","liquid","calcium","protein"],              unit:"L",    unitPrice:"65",  bg:"bg-blue-50"    },
  { id:"ing-31", name:"Butter",             emoji:"🧈", primary:"Food & Dining", sub:"Dairy & Eggs",       tags:["makhon","fat","baking","spread"],                  unit:"g",    unitPrice:"1.2", bg:"bg-yellow-100" },
  { id:"ing-32", name:"Cheese",             emoji:"🧀", primary:"Food & Dining", sub:"Dairy & Eggs",       tags:["paneer","dairy","calcium"],                        unit:"g",    unitPrice:"1.5", bg:"bg-yellow-100" },
  { id:"ing-33", name:"Greek Yogurt",       emoji:"🫙", primary:"Food & Dining", sub:"Dairy & Eggs",       tags:["doi","probiotic","dairy","tangy","curd"],          unit:"ml",   unitPrice:"0.8", bg:"bg-blue-50"    },
  { id:"ing-34", name:"Cream",              emoji:"🥛", primary:"Food & Dining", sub:"Dairy & Eggs",       tags:["heavy cream","fat","baking","malai"],              unit:"ml",   unitPrice:"1",   bg:"bg-slate-50"   },
  // Oils & Fats
  { id:"ing-35", name:"Olive Oil",          emoji:"🫒", primary:"Food & Dining", sub:"Oils & Fats",        tags:["fat","cooking oil","healthy","jaitun"],            unit:"ml",   unitPrice:"1",   bg:"bg-green-100"  },
  { id:"ing-36", name:"Sunflower Oil",      emoji:"🌻", primary:"Food & Dining", sub:"Oils & Fats",        tags:["cooking oil","neutral","fat","tel"],               unit:"ml",   unitPrice:"0.4", bg:"bg-yellow-100" },
  { id:"ing-37", name:"Mustard Oil",        emoji:"🌿", primary:"Food & Dining", sub:"Oils & Fats",        tags:["sarson tel","cooking oil","pungent","sorisha"],    unit:"ml",   unitPrice:"0.5", bg:"bg-yellow-100" },
  { id:"ing-38", name:"Coconut Oil",        emoji:"🥥", primary:"Food & Dining", sub:"Oils & Fats",        tags:["narikel tel","tropical","fat","baking"],           unit:"ml",   unitPrice:"0.8", bg:"bg-amber-50"   },
  // Fruits
  { id:"ing-39", name:"Banana",             emoji:"🍌", primary:"Food & Dining", sub:"Fruits",             tags:["kola","tropical","potassium","sweet"],             unit:"pcs",  unitPrice:"10",  bg:"bg-yellow-100" },
  { id:"ing-40", name:"Apple",              emoji:"🍎", primary:"Food & Dining", sub:"Fruits",             tags:["fiber","sweet","snack","aapel"],                   unit:"pcs",  unitPrice:"25",  bg:"bg-red-100"    },
  { id:"ing-41", name:"Lemon",              emoji:"🍋", primary:"Food & Dining", sub:"Fruits",             tags:["lebu","citrus","sour","vitamin c"],                unit:"pcs",  unitPrice:"8",   bg:"bg-yellow-100" },
  { id:"ing-42", name:"Mango",              emoji:"🥭", primary:"Food & Dining", sub:"Fruits",             tags:["aam","tropical","sweet","vitamin a"],              unit:"pcs",  unitPrice:"30",  bg:"bg-orange-100" },
  { id:"ing-43", name:"Orange",             emoji:"🍊", primary:"Food & Dining", sub:"Fruits",             tags:["komola","citrus","vitamin c","juice"],             unit:"pcs",  unitPrice:"20",  bg:"bg-orange-100" },
  { id:"ing-44", name:"Avocado",            emoji:"🥑", primary:"Food & Dining", sub:"Fruits",             tags:["healthy fat","creamy","omega3"],                   unit:"pcs",  unitPrice:"80",  bg:"bg-green-100"  },
  { id:"ing-45", name:"Strawberry",         emoji:"🍓", primary:"Food & Dining", sub:"Fruits",             tags:["berry","antioxidant","sweet"],                     unit:"g",    unitPrice:"2",   bg:"bg-red-100"    },
  // Spices & Herbs
  { id:"ing-46", name:"Turmeric",           emoji:"🌿", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["halud","yellow","haldi","anti-inflammatory"],      unit:"g",    unitPrice:"0.5", bg:"bg-yellow-100" },
  { id:"ing-47", name:"Cumin",              emoji:"🌿", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["jeera","zira","aromatic","spice"],                 unit:"g",    unitPrice:"0.6", bg:"bg-amber-100"  },
  { id:"ing-48", name:"Coriander",          emoji:"🌿", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["dhania","herb","garnish","cilantro"],              unit:"g",    unitPrice:"0.3", bg:"bg-green-100"  },
  { id:"ing-49", name:"Chili Powder",       emoji:"🌶️",  primary:"Food & Dining", sub:"Spices & Herbs",    tags:["morich","hot","spicy","red pepper","mirch"],      unit:"g",    unitPrice:"0.8", bg:"bg-red-100"    },
  { id:"ing-50", name:"Salt",               emoji:"🧂", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["noon","seasoning","mineral","sodium"],             unit:"g",    unitPrice:"0.05",bg:"bg-slate-100"  },
  { id:"ing-51", name:"Black Pepper",       emoji:"🌿", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["golmorich","peppercorn","spice","seasoning"],      unit:"g",    unitPrice:"1",   bg:"bg-slate-100"  },
  { id:"ing-52", name:"Ginger",             emoji:"🫚", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["ada","root","aromatic","anti-nausea"],             unit:"g",    unitPrice:"0.4", bg:"bg-yellow-100" },
  { id:"ing-53", name:"Cinnamon",           emoji:"🌿", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["darchini","sweet spice","baking","aromatic"],      unit:"g",    unitPrice:"1.5", bg:"bg-amber-100"  },
  { id:"ing-54", name:"Herbs & Spices",     emoji:"🌿", primary:"Food & Dining", sub:"Spices & Herbs",     tags:["mixed","herb","masala","blend","moshla"],          unit:"g",    unitPrice:"0.5", bg:"bg-green-100"  },
  // Nuts & Seeds
  { id:"ing-55", name:"Almonds",            emoji:"🥜", primary:"Food & Dining", sub:"Nuts & Seeds",       tags:["badam","nut","healthy fat","protein"],             unit:"g",    unitPrice:"2",   bg:"bg-amber-100"  },
  { id:"ing-56", name:"Cashews",            emoji:"🥜", primary:"Food & Dining", sub:"Nuts & Seeds",       tags:["kaju","nut","creamy","protein"],                   unit:"g",    unitPrice:"3",   bg:"bg-yellow-100" },
  { id:"ing-57", name:"Sesame Seeds",       emoji:"🌾", primary:"Food & Dining", sub:"Nuts & Seeds",       tags:["til","teel","oil","calcium"],                      unit:"g",    unitPrice:"0.5", bg:"bg-amber-50"   },
  { id:"ing-58", name:"Peanuts",            emoji:"🥜", primary:"Food & Dining", sub:"Nuts & Seeds",       tags:["cheenabadam","groundnut","cheap protein"],         unit:"g",    unitPrice:"0.3", bg:"bg-amber-100"  },
  // Condiments & Sauces
  { id:"ing-59", name:"Sugar",              emoji:"🍬", primary:"Food & Dining", sub:"Condiments & Sauces",tags:["chini","sweet","carb","baking"],                   unit:"g",    unitPrice:"0.06",bg:"bg-pink-100"   },
  { id:"ing-60", name:"Honey",              emoji:"🍯", primary:"Food & Dining", sub:"Condiments & Sauces",tags:["modhu","natural sweet","sugar alternative"],       unit:"ml",   unitPrice:"1.2", bg:"bg-amber-100"  },
  { id:"ing-61", name:"Soy Sauce",          emoji:"🫙", primary:"Food & Dining", sub:"Condiments & Sauces",tags:["condiment","umami","asian","dark sauce"],          unit:"ml",   unitPrice:"0.5", bg:"bg-slate-100"  },
  { id:"ing-62", name:"Tomato Sauce",       emoji:"🍅", primary:"Food & Dining", sub:"Condiments & Sauces",tags:["ketchup","condiment","base","paste"],              unit:"ml",   unitPrice:"0.4", bg:"bg-red-100"    },
  // Transport & Logistics
  { id:"ing-63", name:"Transportation Cost",emoji:"🚗", primary:"Transport & Logistics", sub:"Transportation", tags:["delivery","freight","transport","travel","trip","rickshaw","cng","uber"], unit:"trip", unitPrice:"30", bg:"bg-slate-100" },
];

function searchIngredients(query: string, customDb: IngredientSuggestion[] = []): IngredientSuggestion[] {
  if (!query.trim()) {
    // Custom items always shown first; fill the rest from the popular DB up to 12 total
    const popular = INGREDIENT_DB.slice(0, Math.max(0, 12 - customDb.length));
    return [...customDb, ...popular];
  }
  const q      = query.toLowerCase().trim();
  const fullDb = [...customDb, ...INGREDIENT_DB];
  return fullDb
    .map(item => {
      let score = 0;
      const n = item.name.toLowerCase();
      if (n === q)              score += 100;
      else if (n.startsWith(q)) score += 80;
      else if (n.includes(q))   score += 60;
      for (const tag of item.tags) {
        const t = tag.toLowerCase();
        if (t === q)            score += 50;
        else if (t.includes(q)) score += 30;
        else if (q.includes(t) && t.length > 2) score += 20;
      }
      if (item.sub.toLowerCase().includes(q))     score += 15;
      if (item.primary.toLowerCase().includes(q)) score += 10;
      if (item.isCustom)                          score += 5; // boost saved items for equal matches
      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(x => x.item);
}

/* ── Emoji resolution ───────────────────────────────────────────────────── */
const SUB_EMOJI_DEFAULTS: Record<string, string> = {
  "Proteins":            "🍗",
  "Vegetables":          "🥬",
  "Grains & Staples":    "🍚",
  "Dairy & Eggs":        "🥛",
  "Oils & Fats":         "🫒",
  "Fruits":              "🍎",
  "Spices & Herbs":      "🌿",
  "Nuts & Seeds":        "🥜",
  "Condiments & Sauces": "🍯",
  "Transportation":      "🚗",
};

function getIngredientEmoji(name: string, sub?: string, primary?: string): string {
  const match = INGREDIENT_DB.find(ing => ing.name.toLowerCase() === name.toLowerCase());
  if (match) return match.emoji;
  if (sub && SUB_EMOJI_DEFAULTS[sub]) return SUB_EMOJI_DEFAULTS[sub];
  if (primary === PRIMARY_CAT_TRANSPORT) return "🚗";
  return "📦";
}

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
      const purchaseQuantity = parseFloat(rawPurchaseQty);
      const purchaseAmount   = parseFloat(rawAmountPaid.replace(/[৳$,]/g, ""));
      if (purchaseQuantity > 0) {
        unitPrice   = (purchaseAmount / purchaseQuantity).toFixed(4);
        priceSource = "calculated";
        purchaseQty = rawPurchaseQty;
        amountPaid  = purchaseAmount.toFixed(2);
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

    const cat = assignCategory(name);
    return { id: `csv-${i}`, name, emoji: getIngredientEmoji(name, cat?.sub, cat?.primary), date: date || undefined, qty: displayQty, unit, unitPrice, total, purchaseQty, amountPaid, priceSource, ...(cat ?? {}) };
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
  const currencySymbol= PAYMENT_CONFIG.symbol;

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
          <span className="mt-0.5 text-sm font-bold text-indigo-500 leading-none">{currencySymbol}</span>
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
          Example: <strong>Chicken 3 kg</strong> for <strong>{currencySymbol}550</strong> → unit price = {currencySymbol}183.33/kg.
          {" "}To include delivery charges, add a row: <strong>Item Name = "Transportation Cost"</strong>, Qty = 1, Unit = trip, Unit Price = 30 — it auto-appears in Paid Calculations.
          {" "}Currency: <strong>{PAYMENT_CONFIG.code} ({currencySymbol})</strong> · configured in Payment Settings.
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

/* ── Ingredient search modal (add + edit) ───────────────────────────────── */
function IngredientSearchModal({
  open, onClose, onAdd, editItem, onEdit, customIngredients, onCustomIngredient,
}: {
  open:                boolean;
  onClose:             () => void;
  onAdd:               (item: IngredientItem) => void;
  editItem?:           IngredientItem;
  onEdit?:             (item: IngredientItem) => void;
  customIngredients:   IngredientSuggestion[];
  onCustomIngredient?: (ing: IngredientSuggestion) => void;
}) {
  const currencySymbol     = PAYMENT_CONFIG.symbol;
  const isEdit   = !!editItem;

  const [query,         setQuery]         = useState("");
  const [selected,      setSelected]      = useState<IngredientSuggestion | null>(null);
  const [isCustom,      setIsCustom]      = useState(false);
  const [customPrimary, setCustomPrimary] = useState<string>(PRIMARY_CAT_FOOD);
  const [customSub,     setCustomSub]     = useState<string>(DEFAULT_SUB);
  const [qty,           setQty]           = useState("1");
  const [unit,          setUnit]          = useState("");
  const [unitPrice,     setUnitPrice]     = useState("");
  const [purchaseQty,   setPurchaseQty]   = useState("");
  const [amountPaid,    setAmountPaid]    = useState("");
  const [date,          setDate]          = useState("");
  const [priceError,    setPriceError]    = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery(""); setSelected(null); setIsCustom(false);
      setCustomPrimary(PRIMARY_CAT_FOOD); setCustomSub(DEFAULT_SUB);
      setQty("1"); setUnit(""); setUnitPrice("");
      setPurchaseQty(""); setAmountPaid(""); setDate("");
      setPriceError(false);
      return;
    }
    if (editItem) {
      // Edit mode — pre-fill all fields; synthesize a suggestion from the DB or make a stub
      const dbMatch = INGREDIENT_DB.find(
        ing => ing.name.toLowerCase() === editItem.name.toLowerCase()
      ) ?? null;
      const stub: IngredientSuggestion = dbMatch ?? {
        id:        `stub-${editItem.id}`,
        name:      editItem.name,
        emoji:     "📦",
        primary:   editItem.primary ?? PRIMARY_CAT_FOOD,
        sub:       editItem.sub     ?? DEFAULT_SUB,
        tags:      [],
        unit:      editItem.unit,
        unitPrice: editItem.unitPrice,
        bg:        "bg-slate-100",
      };
      setSelected(stub);
      setQty(editItem.qty);
      setUnit(editItem.unit);
      setUnitPrice(editItem.unitPrice);
      setPurchaseQty(editItem.purchaseQty ?? "");
      setAmountPaid(editItem.amountPaid   ?? "");
      setDate(editItem.date ?? new Date().toISOString().split("T")[0]);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [open, editItem]);

  const results = searchIngredients(query, customIngredients);

  function handleSelect(ing: IngredientSuggestion) {
    setSelected(ing);
    setUnit(ing.unit);
    setUnitPrice(ing.unitPrice);
    setIsCustom(false);
  }

  function handleAddCustom() {
    const name = query.trim();
    if (!name) return;
    const cat     = assignCategory(name);
    const primary = cat?.primary ?? PRIMARY_CAT_FOOD;
    const sub     = cat?.sub     ?? DEFAULT_SUB;
    setCustomPrimary(primary);
    setCustomSub(sub);
    setIsCustom(true);
    setUnit("");
    setUnitPrice("0");
    setSelected({
      id:        `custom-${Date.now()}`,
      name:      name.charAt(0).toUpperCase() + name.slice(1),
      emoji:     "📦",
      primary,
      sub,
      tags:      [],
      unit:      "",
      unitPrice: "0",
      bg:        "bg-slate-100",
      isCustom:  true,
    });
  }

  function handleAdd() {
    if (!selected) return;
    const hasUnitPrice   = parseFloat(unitPrice) > 0;
    const hasPurchaseQty = parseFloat(purchaseQty) > 0;
    const hasAmountPaid  = parseFloat(amountPaid.replace(/[৳$,]/g, "")) > 0;
    const filledCount    = [hasUnitPrice, hasPurchaseQty, hasAmountPaid].filter(Boolean).length;
    if (filledCount < 2) {
      setPriceError(true);
      return;
    }
    setPriceError(false);
    let priceSource: IngredientItem["priceSource"] = "direct";
    const purchaseQuantity = parseFloat(purchaseQty) || 0; // parsed from purchaseQty state
    const purchaseAmount   = parseFloat(amountPaid.replace(/[৳$,]/g, "")) || 0;
    const unitPriceVal     = parseFloat(unitPrice) || 0;

    // Derive whichever of the 3 fields the user left blank
    let finalUnitPrice   = unitPrice;
    let finalPurchaseQty = purchaseQty;
    let finalAmountPaid  = purchaseAmount;

    if (unitPriceVal > 0 && purchaseQuantity > 0 && purchaseAmount === 0) {
      // Unit Price + Purchase Qty → derive Amount Paid
      finalAmountPaid = unitPriceVal * purchaseQuantity;
    } else if (unitPriceVal > 0 && purchaseAmount > 0 && purchaseQuantity === 0) {
      // Unit Price + Amount Paid → derive Purchase Qty
      finalPurchaseQty = (purchaseAmount / unitPriceVal).toFixed(2);
    } else if (purchaseAmount > 0 && purchaseQuantity > 0 && unitPriceVal === 0) {
      // Amount Paid + Purchase Qty → derive Unit Price
      finalUnitPrice = (purchaseAmount / purchaseQuantity).toFixed(4);
      priceSource    = "calculated";
    }

    const finalQty = parseFloat(qty) || 1;
    const total    = (finalQty * parseFloat(finalUnitPrice || "0")).toFixed(2);
    const payload: IngredientItem = {
      id:          isEdit ? editItem!.id : `manual-${Date.now()}`,
      name:        selected.name,
      emoji:       selected.emoji,
      primary:     isCustom ? customPrimary : selected.primary,
      sub:         isCustom ? customSub     : selected.sub,
      date:        date || undefined,
      qty:         String(finalQty),
      unit,
      unitPrice:   finalUnitPrice,
      total,
      purchaseQty: finalPurchaseQty ? String(finalPurchaseQty) : undefined,
      amountPaid:  finalAmountPaid > 0 ? Number(finalAmountPaid).toFixed(2) : undefined,
      priceSource,
    };
    if (isEdit) {
      onEdit?.(payload);
    } else {
      onAdd(payload);
      if (isCustom && selected) {
        onCustomIngredient?.({
          ...selected,
          primary:   customPrimary,
          sub:       customSub,
          unit:      unit || selected.unit,
          unitPrice: finalUnitPrice || "0",
          isCustom:  true,
        });
      }
    }
  }

  const liveTotal = (parseFloat(qty) || 0) * (parseFloat(unitPrice) || 0);

  // Derived price field — computed from whichever 2 of 3 are filled
  const upVal = parseFloat(unitPrice)  || 0;
  const pqVal = parseFloat(purchaseQty) || 0;
  const apVal = parseFloat(amountPaid.replace(/[৳$,]/g, "")) || 0;
  const hasUP = upVal > 0;
  const hasPQ = pqVal > 0;
  const hasAP = apVal > 0;

  let derivedField:   string | null = null;
  let derivedValue:   number | null = null;
  let derivedFormula: string | null = null;

  if (hasUP && hasPQ && !hasAP) {
    derivedField   = "Amount Paid";
    derivedValue   = upVal * pqVal;
    derivedFormula = `${currencySymbol}${upVal} × ${pqVal} ${unit || "unit"}`;
  } else if (hasAP && hasUP && !hasPQ) {
    derivedField   = "Purchase Qty";
    derivedValue   = apVal / upVal;
    derivedFormula = `${currencySymbol}${apVal} ÷ ${currencySymbol}${upVal}`;
  } else if (hasAP && hasPQ && !hasUP) {
    derivedField   = "Unit Price";
    derivedValue   = apVal / pqVal;
    derivedFormula = `${currencySymbol}${apVal} ÷ ${pqVal} ${unit || "unit"}`;
  }

  const modalTitle = isEdit
    ? `Edit — ${editItem!.name}`
    : selected ? `Add ${selected.name}` : "Search Ingredients";
  const modalDesc = isEdit
    ? `${editItem!.primary ?? PRIMARY_CAT_FOOD} · ${editItem!.sub ?? DEFAULT_SUB}`
    : selected
      ? isCustom
        ? `${customPrimary} · ${customSub} · custom item`
        : `${selected.primary} · ${selected.sub}`
      : "Type to search, or add a custom item not in the list";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDesc}
      size="lg"
      footer={
        selected ? (
          <>
            {!isEdit && (
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => { setSelected(null); setIsCustom(false); }}>
                Change
              </Button>
            )}
            <Button size="sm" onClick={handleAdd}>
              {isEdit ? "Save Changes" : "Add to Ingredients"}
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        )
      }
    >
      {!selected ? (
        /* ── Step 1: Search & Pick ── */
        <div className="flex flex-col gap-4">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by name, category, or Bengali keyword…"
            size="md"
            fullWidth
          />
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {query.trim()
                ? `Results (${results.length})`
                : customIngredients.length > 0
                  ? `Grocery Library · ${customIngredients.length} saved`
                  : "Popular Ingredients"}
            </p>
            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-sm font-medium text-slate-600">No ingredients found</p>
                <p className="text-xs text-slate-400">Try a different spelling, or add it as a custom item</p>
                {query.trim() && (
                  <Button size="sm" icon={Plus} onClick={handleAddCustom}>
                    Add &ldquo;{query.trim()}&rdquo; as custom item
                  </Button>
                )}
              </div>
            ) : (
              <>
                <motion.div
                  key={query}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                  variants={SEARCH_GRID_VARIANTS}
                  initial="hidden"
                  animate="show"
                >
                  {results.map(ing => (
                    <motion.button
                      key={ing.id}
                      variants={SEARCH_ITEM_VARIANTS}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      onClick={() => handleSelect(ing)}
                      className={`relative flex flex-col items-center rounded-xl border-2 ${ing.isCustom ? "border-violet-200" : "border-transparent"} ${ing.bg} p-3 text-center transition-colors hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                    >
                      {ing.isCustom && (
                        <span className="absolute top-1.5 right-1.5 rounded-full bg-violet-500 px-1.5 py-0.5 text-[8px] font-bold text-white leading-none">
                          Saved
                        </span>
                      )}
                      <span className="text-3xl leading-none mb-1.5">{ing.emoji}</span>
                      <p className="text-[11px] font-semibold text-slate-800 leading-tight">{ing.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate w-full text-center">{ing.sub}</p>
                      <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                        {currencySymbol}{ing.unitPrice}/{ing.unit}
                      </p>
                    </motion.button>
                  ))}
                </motion.div>
                {query.trim() && (
                  <div className="mt-3 flex items-center justify-center gap-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] text-slate-400">Not what you&apos;re looking for?</span>
                    <Button size="sm" variant="outline" icon={Plus} onClick={handleAddCustom}>
                      Add &ldquo;{query.trim()}&rdquo; as custom item
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* ── Step 2: Fill Details ── */
        <div className="flex flex-col gap-4">
          {/* Selected ingredient header */}
          <div className={`flex items-center gap-3 rounded-xl border-2 ${isCustom ? "border-violet-200 bg-violet-50" : "border-indigo-200"} ${isCustom ? "" : selected.bg} px-4 py-3`}>
            <span className="text-3xl leading-none">{selected.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{selected.name}</p>
                {isCustom && (
                  <span className="rounded-full border border-violet-300 bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isCustom ? customPrimary : selected.primary} · {isCustom ? customSub : selected.sub}
              </p>
            </div>
            {!isCustom && (
              <span className="text-[11px] font-semibold text-emerald-600 shrink-0">
                est. {currencySymbol}{selected.unitPrice}/{selected.unit}
              </span>
            )}
          </div>

          {/* Category pickers — only for custom items */}
          {isCustom && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-violet-800">Primary Category</label>
                <select
                  value={customPrimary}
                  onChange={e => {
                    setCustomPrimary(e.target.value);
                    setCustomSub(Object.keys(CATEGORY_TAXONOMY[e.target.value] ?? {})[0] ?? DEFAULT_SUB);
                  }}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {Object.keys(CATEGORY_TAXONOMY).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-violet-800">Subcategory</label>
                <select
                  value={customSub}
                  onChange={e => setCustomSub(e.target.value)}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {Object.keys(CATEGORY_TAXONOMY[customPrimary] ?? {}).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {!CATEGORY_TAXONOMY[customPrimary]?.[DEFAULT_SUB] && (
                    <option value={DEFAULT_SUB}>Other</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TextField
              label="Qty"
              type="number"
              min="0"
              step="any"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="1"
              size="sm"
              fullWidth
            />
            <TextField
              label="Unit"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="kg / g / pcs / L"
              size="sm"
              fullWidth
            />
            <TextField
              label={`Unit Price (${currencySymbol})`}
              type="number"
              min="0"
              step="any"
              value={unitPrice}
              onChange={e => { setUnitPrice(e.target.value); setPriceError(false); }}
              placeholder="e.g. 180"
              hint={priceError ? undefined : "Pre-filled from ingredient — edit if needed"}
              error={priceError ? "Fill any 2 of: Unit Price · Purchase Qty · Amount Paid" : undefined}
              size="sm"
              fullWidth
            />
            <TextField
              label="Purchase Qty"
              type="number"
              min="0"
              step="any"
              value={purchaseQty}
              onChange={e => { setPurchaseQty(e.target.value); setPriceError(false); }}
              placeholder="e.g. 3"
              hint={priceError ? undefined : "Total quantity purchased"}
              error={priceError ? "Fill any 2 of: Unit Price · Purchase Qty · Amount Paid" : undefined}
              size="sm"
              fullWidth
            />
            <TextField
              label={`Amount Paid (${currencySymbol})`}
              type="number"
              min="0"
              step="any"
              value={amountPaid}
              onChange={e => { setAmountPaid(e.target.value); setPriceError(false); }}
              placeholder="e.g. 550"
              hint={priceError ? undefined : "Auto-calculates unit price if left blank above"}
              error={priceError ? "Fill any 2 of: Unit Price · Purchase Qty · Amount Paid" : undefined}
              size="sm"
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              size="sm"
              fullWidth
            />
          </div>

          {/* Live total preview */}
          {liveTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
              <span className="text-xs text-indigo-600">
                {qty || "1"} {unit} × {currencySymbol}{unitPrice} =
              </span>
              <span className="text-sm font-bold text-indigo-700">{currencySymbol}{liveTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Derived price field — shown when exactly 2 of 3 price fields are filled */}
          <AnimatePresence mode="wait">
            {derivedField !== null && derivedValue !== null && (
              <motion.div
                key={derivedField}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                    =
                  </span>
                  <span className="text-xs text-emerald-700">
                    <span className="font-semibold">{derivedField}</span>
                    <span className="mx-1.5 text-emerald-400">·</span>
                    {derivedFormula}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-700">
                  {derivedField === "Purchase Qty"
                    ? `${derivedValue.toFixed(2)} ${unit || "unit"}`
                    : `${currencySymbol}${derivedValue.toFixed(2)}`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Modal>
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
  const [activeMembers, setActiveMembers] = useState(() => getOrgActiveMembers(orgSlug));

  // Tenant-scoped custom ingredient library, persisted across sessions
  const [customIngredients, setCustomIngredients] = useState<IngredientSuggestion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`custom-ingredients-${orgSlug}`);
      return stored ? (JSON.parse(stored) as IngredientSuggestion[]) : [];
    } catch {
      return [];
    }
  });

  function saveCustomIngredient(ing: IngredientSuggestion) {
    setCustomIngredients(prev => {
      // Deduplicate by name (case-insensitive)
      if (prev.some(i => i.name.toLowerCase() === ing.name.toLowerCase())) return prev;
      const updated = [...prev, { ...ing, isCustom: true }];
      try { localStorage.setItem(`custom-ingredients-${orgSlug}`, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  // Filter state
  const [filterDate,    setFilterDate]    = useState<string>(FILTER_ALL);
  const [filterPrimary, setFilterPrimary] = useState<string>(FILTER_ALL);
  const [filterSub,     setFilterSub]     = useState<string>(FILTER_ALL);
  const [filterSource,  setFilterSource]  = useState<string>(FILTER_ALL);
  const [filterItemName,    setFilterItem]    = useState<string>(FILTER_ALL);

  // Ingredient search / edit modal
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [editingItem,  setEditingItem]  = useState<IngredientItem | null>(null);

  // Flat list of all items across all uploaded days
  const items    = uploads.flatMap(u => u.items);
  const uploaded = uploads.length > 0;

  // Filter option lists — each level restricted to what exists under the active upstream filters

  // Date: always all uploaded dates (top of cascade, no upstream filter)
  const dateOptions = [...new Set(uploads.map(u => u.date))].sort();

  // Source: only sources that exist on the selected date
  const sourceOptions = [...new Set(
    uploads
      .filter(u => filterDate === FILTER_ALL || u.date === filterDate)
      .map(u => u.source)
  )].sort() as ("receipt" | "csv" | "manual")[];

  // Items that survive date + source filters — used as the base for category options
  const dateSourceItems = uploads
    .filter(u => {
      if (filterDate   !== FILTER_ALL && u.date   !== filterDate)   return false;
      if (filterSource !== FILTER_ALL && u.source !== filterSource) return false;
      return true;
    })
    .flatMap(u => u.items);

  // Primary: only categories present in date+source filtered items
  const primaryOptions = [...new Set(
    dateSourceItems.map(i => i.primary).filter((v): v is string => !!v)
  )].sort();

  // Subcategory: only subcategories present within the selected primary (and date+source)
  const subOptions = [...new Set(
    dateSourceItems
      .filter(i => filterPrimary === FILTER_ALL || i.primary === filterPrimary)
      .map(i => i.sub).filter((v): v is string => !!v)
  )].sort();

  // Item names: only names present within selected primary+sub (and date+source)
  const itemNameOptions = [...new Set(
    dateSourceItems
      .filter(i => {
        if (filterPrimary !== FILTER_ALL && i.primary !== filterPrimary) return false;
        if (filterSub     !== FILTER_ALL && i.sub     !== filterSub)     return false;
        return true;
      }).map(i => i.name)
  )].sort();

  const anyFilterActive = filterDate !== FILTER_ALL || filterPrimary !== FILTER_ALL || filterSub !== FILTER_ALL || filterSource !== FILTER_ALL || filterItemName !== FILTER_ALL;

  // Uploads filtered by date/source first, then items filtered by category/item
  const filteredUploads = uploads
    .filter(upload => {
      if (filterDate   !== FILTER_ALL && upload.date   !== filterDate)   return false;
      if (filterSource !== FILTER_ALL && upload.source !== filterSource) return false;
      return true;
    })
    .map(upload => ({
      ...upload,
      items: upload.items.filter(item => {
        if (filterPrimary !== FILTER_ALL && item.primary !== filterPrimary) return false;
        if (filterSub     !== FILTER_ALL && item.sub     !== filterSub)     return false;
        if (filterItemName    !== FILTER_ALL && item.name    !== filterItemName)     return false;
        return true;
      }),
    })).filter(u => u.items.length > 0);

  const filteredItemCount = filteredUploads.flatMap(u => u.items).length;

  const currencySymbol       = PAYMENT_CONFIG.symbol;
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
  const autoCalculatedCount      = items.filter(it => it.priceSource === "calculated").length;
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

  async function generateReport() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W   = doc.internal.pageSize.getWidth();   // 210
    const H   = doc.internal.pageSize.getHeight();  // 297
    const ML  = 14;
    const MR  = W - ML;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    // jsPDF Helvetica only covers Latin-1 — strip emoji and replace ৳ with the code
    const clean = (s: string) =>
      s.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();

    // Thousands-separated amount, e.g. "BDT 66,711.60"
    const money = (n: number) =>
      `${PAYMENT_CONFIG.code} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // ── Header (two-tone) ────────────────────────────────────────────────
    doc.setFillColor(49, 46, 129);   // indigo-900 — right panel
    doc.rect(0, 0, W, 34, "F");
    doc.setFillColor(79, 70, 229);   // indigo-600 — left brand panel
    doc.rect(0, 0, 85, 34, "F");

    // Brand (left)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("NutraTenant", ML, 13);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(199, 210, 254);
    doc.text("Meal Service  |  Goods Cost Report", ML, 21);
    doc.setFontSize(7);
    doc.setTextColor(165, 180, 252);
    doc.text("CONFIDENTIAL - Internal Use Only", ML, 29);

    // Separator
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.4);
    doc.line(87, 5, 87, 29);

    // Report meta (right)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Goods Cost Report", MR, 12, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(199, 210, 254);
    doc.text(orgName, MR, 20, { align: "right" });
    doc.text(`${dateStr}  |  ${PAYMENT_CONFIG.code}`, MR, 27, { align: "right" });

    let y = 44;

    // ── Helpers ──────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function pageCheck(needed = 60) { if (y > H - needed) { doc.addPage(); y = 18; } }

    function sectionHead(title: string) {
      pageCheck(80);
      doc.setFillColor(238, 242, 255);
      doc.rect(ML, y, W - ML * 2, 8, "F");
      doc.setFillColor(79, 70, 229);
      doc.rect(ML, y, 3, 8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 48, 163);
      doc.text(title.toUpperCase(), ML + 7, y + 5.5);
      y += 13;
    }

    // Draw a single metric card
    function metricCard(
      cx: number, cy: number, cw: number, ch: number,
      label: string, value: string,
      accent: [number, number, number],
    ) {
      // Card bg + border
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(cx, cy, cw, ch, 2, 2, "F");
      doc.setDrawColor(224, 231, 255);
      doc.setLineWidth(0.2);
      doc.roundedRect(cx, cy, cw, ch, 2, 2, "S");
      // Left accent bar
      doc.setFillColor(...accent);
      doc.roundedRect(cx, cy, 3, ch, 1, 1, "F");
      // Label
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(label, cx + 7, cy + 6);
      // Value
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(value, cx + 7, cy + 14);
    }

    // ── Section 1 — Executive Summary ────────────────────────────────────
    sectionHead("Executive Summary");

    type Accent = [number, number, number];
    const metrics: { label: string; value: string; accent: Accent }[] = [
      { label: "Total Goods Cost",                      value: money(totalAmount),          accent: [79,  70,  229] },
      { label: "Cost per Meal",                         value: money(Number(costPerMeal)),  accent: [16,  185, 129] },
      { label: `Daily Cost (${activeMembers} members)`, value: money(Number(dailyCost)),    accent: [245, 158, 11]  },
      { label: "Monthly Estimate (30 days)",            value: money(Number(monthlyCost)),  accent: [239, 68,  68]  },
      { label: "Total Meals",                           value: mealsCount.toLocaleString(), accent: [99,  102, 241] },
      { label: "Days Uploaded",                         value: String(uploads.length),      accent: [148, 163, 184] },
    ];
    if (uploads.length > 1) {
      metrics.push({ label: "Daily Avg Spend", value: money(totalAmount / uploads.length), accent: [20, 184, 166] });
    }

    const colCount = 2;
    const gap      = 4;
    const cardW    = (W - ML * 2 - gap * (colCount - 1)) / colCount;
    const cardH    = 19;

    for (let i = 0; i < metrics.length; i++) {
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      metricCard(
        ML + col * (cardW + gap),
        y + row * (cardH + 3),
        cardW, cardH,
        metrics[i].label, metrics[i].value, metrics[i].accent,
      );
    }
    y += Math.ceil(metrics.length / colCount) * (cardH + 3) + 8;

    // ── Section 2 — Item Breakdown ────────────────────────────────────────
    sectionHead("Item Breakdown");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemBody: any[][] = [];
    for (const upload of uploads) {
      let dayTotal = 0;
      for (const item of upload.items) {
        const total = parseFloat(item.total || "0");
        dayTotal += total;
        itemBody.push([
          upload.date,
          clean(item.name),
          item.primary ?? "—",
          item.sub ?? "—",
          `${item.qty} ${item.unit}`,
          `${PAYMENT_CONFIG.code} ${item.unitPrice}`,
          money(total),
        ]);
      }
      if (uploads.length > 1) {
        itemBody.push([
          {
            content: `${upload.date}  -  Day Subtotal`,
            colSpan: 6,
            styles: { fontStyle: "bold", fillColor: [224, 231, 255], textColor: [67, 56, 202] },
          },
          {
            content: money(dayTotal),
            styles: { halign: "right", fontStyle: "bold", fillColor: [224, 231, 255], textColor: [67, 56, 202] },
          },
        ]);
      }
    }

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: ML },
      head: [["Date", "Item Name", "Category", "Sub-category", "Qty", `Unit Price`, `Total (${PAYMENT_CONFIG.code})`]],
      body: itemBody,
      foot: [["", "", "", "", "", "Grand Total", money(totalAmount)]],
      headStyles: {
        fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: "bold",
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      },
      bodyStyles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
      footStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 45 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", fontStyle: "bold", cellWidth: 28 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    pageCheck(65);

    // ── Section 3 — Cost per Meal Type ────────────────────────────────────
    sectionHead("Cost per Meal Type");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mealBody: any[][] = MEAL_TYPE_DEFS.map(mt => {
      const count     = mealCounts[mt.key];
      const costShare = mealsCount > 0 && count > 0 ? (count / mealsCount) * totalAmount : 0;
      const pct       = mealsCount > 0 && count > 0
        ? `${((count / mealsCount) * 100).toFixed(1)}%` : "0.0%";
      const perMeal   = count > 0 ? money(costShare / count) : "—";
      return [clean(mt.label), count.toLocaleString(), pct, money(costShare), perMeal];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: ML },
      head: [["Meal Type", "Meals", "% Share", `Cost Share (${PAYMENT_CONFIG.code})`, `Per Meal (${PAYMENT_CONFIG.code})`]],
      body: mealBody,
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9, fontStyle: "bold", cellPadding: 3 },
      bodyStyles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [238, 242, 255] },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { halign: "center", cellWidth: 18 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right",  cellWidth: 45 },
        4: { halign: "right",  fontStyle: "bold", cellWidth: 45 },
      },
    });

    // ── Footer on every page ─────────────────────────────────────────────
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      // Footer strip
      doc.setFillColor(248, 250, 252);
      doc.rect(0, H - 14, W, 14, "F");
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.line(0, H - 14, W, H - 14);
      // Left text
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`NutraTenant  |  ${orgName}  |  Goods Cost Report  |  CONFIDENTIAL`, ML, H - 6);
      // Page badge
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(MR - 20, H - 11.5, 20, 7, 1.5, 1.5, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`Page ${p} / ${totalPages}`, MR - 10, H - 6.8, { align: "center" });
    }

    doc.save(`goods-cost-report-${orgSlug}-${now.toISOString().slice(0, 10)}.pdf`);
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

  function updateItem(updated: IngredientItem) {
    setUploads(prev =>
      prev.map(u => ({
        ...u,
        items: u.items.map(it => it.id === updated.id ? updated : it),
      }))
    );
  }

  function addManualItem(item: IngredientItem) {
    const today = new Date().toISOString().split("T")[0];
    const date  = item.date || today;
    setUploads(prev => {
      if (prev.some(u => u.date === date)) {
        return prev
          .map(u => u.date === date
            ? { ...u, items: [...u.items, { ...item, id: `${date}-m${Date.now()}` }] }
            : u)
          .sort((a, b) => a.date.localeCompare(b.date));
      }
      return [
        ...prev,
        { id: `manual-${date}`, date, filename: "Manual entry", source: "manual" as const, items: [{ ...item, id: `${date}-m${Date.now()}` }] },
      ].sort((a, b) => a.date.localeCompare(b.date));
    });
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
            Currency: <span className="font-medium text-slate-700">{PAYMENT_CONFIG.code} ({currencySymbol})</span>
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
                      const autoCalculatedCount    = upload.items.filter(it => it.priceSource === "calculated").length;
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
                              : upload.source === "manual"
                              ? <Plus            className="h-4 w-4 text-indigo-600" />
                              : <FileText        className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <Calendar className="h-2.5 w-2.5" />{upload.date}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">{upload.filename}</span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-emerald-700">
                              {upload.items.length} items · {formatCurrency(dayTotal)}
                              {autoCalculatedCount > 0 && ` · ${autoCalculatedCount} auto-priced`}
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
                    Total <strong>{formatCurrency(totalAmount)}</strong> ÷ <strong>{mealsCount} meals</strong> = <strong>{formatCurrency(costPerMeal)} / meal</strong>.
                    {" "}Serving <strong>{activeMembers.toLocaleString()} {orgName} members</strong> = <strong>{formatCurrency(Number(dailyCost).toFixed(2))} / day</strong>.
                    {uploads.length > 1 && (
                      <> · Daily avg spend: <strong>{formatCurrency(totalAmount / uploads.length)}</strong></>
                    )}
                    {autoCalculatedCount > 0 && ` · ${autoCalculatedCount} unit prices auto-calculated`}
                  </p>
                </motion.div>
              )}
            </div>
          </SlideUp>

          {/* Step 3 — Ingredients table (always visible) */}
          <SlideUp delay={0.08} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Ingredients — {uploads.length > 1 ? `${uploads.length} days` : uploads[0]?.date ?? "Today"}
                      </h2>
                      <p className="text-[11px] text-slate-400">Prices in {PAYMENT_CONFIG.code} ({currencySymbol}) · grouped by date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600">
                      {items.length} items
                    </span>
                    {autoCalculatedCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Zap className="h-3 w-3" />
                        {autoCalculatedCount} auto-priced
                      </span>
                    )}
                    <Button variant="outline" size="sm" icon={Download}
                      onClick={() => {
                        const rows = [
                          ["Date","Item Name","Qty","Unit","Unit Price","Purchase Qty","Amount Paid","Total","Price Source","Currency"],
                          ...items.map(it => [
                            it.date ?? "",
                            it.name, it.qty, it.unit,
                            `${currencySymbol}${it.unitPrice}`,
                            it.purchaseQty ?? "",
                            it.amountPaid ? `${currencySymbol}${it.amountPaid}` : "",
                            formatCurrency(it.total),
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
                    <Button variant="secondary" size="sm" icon={Plus} onClick={() => setSearchOpen(true)}>Add Item</Button>
                  </div>
                </div>

                {items.length === 0 ? (
                  /* ── Empty state ── */
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Plus className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">No ingredients yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Upload a receipt or CSV above, or add items manually
                      </p>
                    </div>
                    <Button size="sm" icon={Plus} onClick={() => setSearchOpen(true)}>
                      Add First Ingredient
                    </Button>
                  </div>
                ) : (
                <>
                {/* ── Filter bar ── */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                  <Filter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-500 mr-0.5">Filter:</span>

                  <select
                    value={filterDate}
                    onChange={e => {
                      setFilterDate(e.target.value);
                      setFilterSource(FILTER_ALL);
                      setFilterPrimary(FILTER_ALL);
                      setFilterSub(FILTER_ALL);
                      setFilterItem(FILTER_ALL);
                    }}
                    disabled={dateOptions.length === 0}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40"
                  >
                    <option value={FILTER_ALL}>All Dates</option>
                    {dateOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <select
                    value={filterPrimary}
                    onChange={e => { setFilterPrimary(e.target.value); setFilterSub(FILTER_ALL); setFilterItem(FILTER_ALL); }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value={FILTER_ALL}>All Categories</option>
                    {primaryOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>

                  <select
                    value={filterSub}
                    onChange={e => { setFilterSub(e.target.value); setFilterItem(FILTER_ALL); }}
                    disabled={subOptions.length === 0}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40"
                  >
                    <option value={FILTER_ALL}>All Subcategories</option>
                    {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select
                    value={filterSource}
                    onChange={e => {
                      setFilterSource(e.target.value);
                      setFilterPrimary(FILTER_ALL);
                      setFilterSub(FILTER_ALL);
                      setFilterItem(FILTER_ALL);
                    }}
                    disabled={sourceOptions.length === 0}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40"
                  >
                    <option value={FILTER_ALL}>All Sources</option>
                    {sourceOptions.map(s => (
                      <option key={s} value={s}>
                        {s === "receipt" ? "Receipt / Image" : s === "csv" ? "CSV Template" : "Manual Entry"}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterItemName}
                    onChange={e => setFilterItem(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value={FILTER_ALL}>All Items</option>
                    {itemNameOptions.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>

                  {anyFilterActive && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setFilterDate(FILTER_ALL); setFilterPrimary(FILTER_ALL); setFilterSub(FILTER_ALL); setFilterSource(FILTER_ALL); setFilterItem(FILTER_ALL); }}
                        className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                      >
                        <X className="h-2.5 w-2.5" /> Clear
                      </button>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={filteredItemCount}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.15 }}
                          className="text-[10px] text-slate-400"
                        >
                          {filteredItemCount} of {items.length} items
                        </motion.span>
                      </AnimatePresence>
                    </>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-slate-50 bg-slate-50">
                      <tr>
                        {["#", "Date", "Item Name", "Recipe Qty", "Unit", `Unit Price (${currencySymbol})`, "Purchase Info", `Total (${currencySymbol})`, ""].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUploads.map(upload => {
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
                                  <span className="text-[10px] font-semibold text-indigo-600">{formatCurrency(dayTotal)}</span>
                                  <span className="ml-auto text-[10px] text-indigo-400 truncate">{upload.filename}</span>
                                </div>
                              </td>
                            </tr>
                            {/* Items for this day */}
                            <AnimatePresence mode="popLayout">
                            {upload.items.map((item, i) => (
                              <motion.tr
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, transition: { duration: 0.18 } }}
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
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl leading-none shrink-0" aria-hidden="true">
                                      {item.emoji ?? getIngredientEmoji(item.name, item.sub, item.primary)}
                                    </span>
                                    <div>
                                      <div className="font-medium text-slate-900">{item.name}</div>
                                      {item.sub && (
                                        <div className="text-[9px] text-slate-400 mt-0.5">{item.sub}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-slate-600">{item.qty}</td>
                                <td className="px-4 py-2.5 text-slate-500">{item.unit}</td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-600">{currencySymbol}{item.unitPrice}/{item.unit || "unit"}</span>
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
                                      {item.purchaseQty} {item.unit} = {currencySymbol}{item.amountPaid}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-0.5">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                      type="button"
                                      onClick={() => setEditingItem(item)}
                                      className="rounded-lg p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                                      aria-label={`Edit ${item.name}`}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                      type="button" onClick={() => removeItem(item.id)}
                                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                      aria-label={`Delete ${item.name}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </motion.button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                            </AnimatePresence>
                            {/* Day subtotal row (only shown when multiple days visible) */}
                            {filteredUploads.length > 1 && (
                              <tr className="border-b border-indigo-100 bg-indigo-50/40">
                                <td colSpan={7} className="px-4 py-1.5 text-right text-[10px] font-semibold text-indigo-500">
                                  {upload.date} subtotal
                                </td>
                                <td className="px-4 py-1.5 text-[11px] font-bold text-indigo-700">{formatCurrency(dayTotal)}</td>
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
                        <td className="px-4 py-2.5 font-bold text-slate-900">{formatCurrency(totalAmount)}</td>
                        <td />
                      </tr>
                      {anyFilterActive && (
                        <tr>
                          <td colSpan={9} className="px-4 py-1.5 text-center text-[10px] text-slate-400">
                            Showing {filteredItemCount} of {items.length} items · Total reflects all items
                          </td>
                        </tr>
                      )}
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
                            {perMeal
                              ? <AnimatedNumber value={Number(perMeal)} prefix={currencySymbol} decimals={2} />
                              : "—"}
                            <span className="text-[10px] font-normal text-slate-400">/meal</span>
                          </p>
                          <p className={`text-[10px] ${mt.text} opacity-70`}>
                            {count} meals · <AnimatedNumber value={costShare} prefix={currencySymbol} decimals={2} />
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-3">
                  <Button variant="secondary" size="sm" onClick={handleReset}>Reset</Button>
                  <Button size="sm" icon={Calculator} onClick={generateReport}>Generate Report</Button>
                </div>
                </>
                )}
          </SlideUp>
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
                  { col: "G", label: "Amount Paid",  note: `e.g. ${currencySymbol}550` },
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
                { label: "Total Amount",                                      value: totalAmount,          lg: false },
                { label: "Cost Per Meal",                                     value: Number(costPerMeal),  lg: true  },
                { label: `Daily (${activeMembers.toLocaleString()} members)`, value: Number(dailyCost),    lg: false },
                { label: "Monthly Est.",                                      value: Number(monthlyCost),  lg: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-indigo-200">{item.label}</span>
                  <AnimatedNumber
                    value={item.value}
                    prefix={currencySymbol}
                    decimals={2}
                    className={`font-bold text-white ${item.lg ? "text-2xl" : "text-sm"}`}
                  />
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
                        <span className="font-semibold text-white">{formatCurrency(dayTotal)}</span>
                      </div>
                    );
                  })}
                  <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-1.5 text-[11px]">
                    <span className="text-indigo-300">Avg / day</span>
                    <span className="font-bold text-white">{formatCurrency(totalAmount / uploads.length)}</span>
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
                        {perMeal ? `${currencySymbol}${perMeal}/meal` : "—"}
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
                      <span className="text-xl font-bold text-slate-400">{currencySymbol}</span>
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
                  val:   formatCurrency(costPerMeal),
                  note:  undefined,
                },
                {
                  label: "Transportation",
                  val:   `+${formatCurrency(transportPerMeal)}`,
                  note:  transportTotal > 0 ? `${currencySymbol}${transportTotal.toFixed(2)} total` : "from CSV",
                },
                {
                  label: "Cooking Cost",
                  val:   `+${currencySymbol}0.85`,
                  note:  undefined,
                },
                {
                  label: "Packaging",
                  val:   `+${currencySymbol}0.45`,
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
                  {formatCurrency(Number(costPerMeal) + transportPerMeal + 0.85 + 0.45)}
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
                        one to the market, one return). Total transport spend: <strong>{formatCurrency(transportTotal)}</strong>.
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

      {/* Ingredient add / edit modal */}
      <IngredientSearchModal
        open={searchOpen || !!editingItem}
        onClose={() => { setSearchOpen(false); setEditingItem(null); }}
        onAdd={item  => { addManualItem(item); setSearchOpen(false); }}
        editItem={editingItem ?? undefined}
        onEdit={item => { updateItem(item); setEditingItem(null); }}
        customIngredients={customIngredients}
        onCustomIngredient={saveCustomIngredient}
      />
    </div>
  );
}

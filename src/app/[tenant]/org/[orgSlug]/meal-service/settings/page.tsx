"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Bell, Lock, Globe, Palette, Building2, CreditCard, Plug, Save,
  Upload, Trash2, Database, RefreshCw, HardDrive, CheckCircle2,
  Download, ChevronDown, CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SlideUp, SlideIn } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Shared sub-components ─────────────────────────────────────────────── */
function ToggleRow({
  label, desc, defaultOn = false,
}: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-900">{label}</p>
        {desc && <p className="mt-0.5 text-[11px] text-slate-400">{desc}</p>}
      </div>
      <motion.button
        type="button"
        onClick={() => setOn(v => !v)}
        whileTap={{ scale: 0.95 }}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <motion.span
          layout
          className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow"
          animate={{ x: on ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function SelectField({ label, options, defaultValue }: { label: string; options: string[]; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700">{label}</label>
      <div className="relative">
        <select defaultValue={defaultValue} className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

/* ── Weekly default plans ────────────────────────────────────────────────── */
export const DAY_PLAN_KEY = "meal-planner-day-defaults";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type WeekDay = typeof WEEK_DAYS[number];

export const PLAN_OPTIONS = [
  "Balanced Plan",
  "High Protein",
  "Vegetarian Plan",
  "Keto Flex",
  "Vegan Power",
  "Med. Plan",
  "Athlete Pro",
  "Low Carb",
  "Detox Cleanse",
];

const DEFAULT_DAY_PLANS: Record<WeekDay, string> = {
  Mon: "Balanced Plan", Tue: "High Protein",    Wed: "Vegetarian Plan",
  Thu: "Balanced Plan", Fri: "Keto Flex",        Sat: "Athlete Pro",
  Sun: "Balanced Plan",
};

function loadDayPlans(): Record<WeekDay, string> {
  if (typeof window === "undefined") return { ...DEFAULT_DAY_PLANS };
  try {
    const stored = localStorage.getItem(DAY_PLAN_KEY);
    return stored ? { ...DEFAULT_DAY_PLANS, ...(JSON.parse(stored) as Partial<Record<WeekDay, string>>) } : { ...DEFAULT_DAY_PLANS };
  } catch {
    return { ...DEFAULT_DAY_PLANS };
  }
}

const STORAGE_DATA = [
  { name: "Used",  value: 62, color: "#6366f1" },
  { name: "Free",  value: 38, color: "#e2e8f0" },
];

const TABS = [
  { id: "org",          label: "Organization Settings",   icon: Building2  },
  { id: "meal",         label: "Meal Service Settings",   icon: Globe       },
  { id: "payment",      label: "Payment Settings",        icon: CreditCard  },
  { id: "notification", label: "Notification Settings",   icon: Bell        },
  { id: "preferences",  label: "Use & Preferences",       icon: Palette     },
  { id: "integrations", label: "Integrations",            icon: Plug        },
] as const;

type TabId = typeof TABS[number]["id"];

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("org");
  const [saved,     setSaved]     = useState(false);
  const [dayPlans,  setDayPlans]  = useState<Record<WeekDay, string>>(loadDayPlans);

  function handleSave() {
    try { localStorage.setItem(DAY_PLAN_KEY, JSON.stringify(dayPlans)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your meal service preferences and configuration.</p>
        </div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button size="sm" icon={saved ? CheckCircle2 : Save} onClick={handleSave}
            className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </motion.div>
      </FadeIn>

      {/* Tab nav */}
      <FadeIn>
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />{tab.label}
              </motion.button>
            );
          })}
        </div>
      </FadeIn>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {activeTab === "org" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Left: org info + branding */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {/* Organization Info */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-slate-900">Organization Information</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Organization Name" defaultValue="NutraCorp" />
                    <Field label="Organization Type" defaultValue="Food Service Provider" />
                    <Field label="Email Address" defaultValue="admin@nutracorp.test" type="email" />
                    <Field label="Phone Number" defaultValue="+1 (800) 123-4567" type="tel" />
                    <div className="sm:col-span-2">
                      <Field label="Address" defaultValue="123 Business Ave, Suite 100, New York, NY 10001" />
                    </div>
                  </div>
                </div>

                {/* Branding */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-slate-900">Branding &amp; Preferences</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-slate-700">Logo</p>
                      <motion.div
                        whileHover={{ borderColor: "#6366f1" }}
                        className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-colors hover:bg-indigo-50/40"
                      >
                        <Upload className="h-5 w-5 text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500">Drag &amp; drop or <span className="font-semibold text-indigo-600">Choose file</span></p>
                        <p className="text-[10px] text-slate-400">PNG, JPG up to 2MB</p>
                      </motion.div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <SelectField label="Date Format"  options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]} defaultValue="MM/DD/YYYY" />
                      <SelectField label="Time Format"  options={["12-hour (AM/PM)", "24-hour"]} defaultValue="12-hour (AM/PM)" />
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-700">Brand Color</p>
                        <div className="flex items-center gap-2">
                          {["bg-indigo-600", "bg-emerald-600", "bg-violet-600", "bg-rose-600", "bg-sky-600"].map(c => (
                            <motion.button whileHover={{ scale: 1.15 }} key={c} type="button"
                              className={`h-7 w-7 rounded-full border-2 border-white shadow ${c}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data management */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-semibold text-slate-900">Data Management</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Export Data",  icon: Download,  desc: "Download all your data as CSV or JSON" },
                      { label: "Backup Data",  icon: HardDrive, desc: "Create a full system backup" },
                      { label: "Clear Cache",  icon: RefreshCw, desc: "Clear all cached data and temp files" },
                      { label: "Reset Data",   icon: Trash2,    desc: "Permanently reset to factory defaults", danger: true },
                    ].map(a => {
                      const Icon = a.icon;
                      return (
                        <motion.button
                          key={a.label}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          className={`flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${a.danger ? "border-rose-200 bg-rose-50 hover:bg-rose-100" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
                        >
                          <Icon className={`h-5 w-5 ${a.danger ? "text-rose-500" : "text-slate-500"}`} />
                          <p className={`mt-1.5 text-xs font-semibold ${a.danger ? "text-rose-700" : "text-slate-700"}`}>{a.label}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">{a.desc}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-4">
                {/* Subscription */}
                <SlideIn from="right" className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-md">
                  <p className="text-xs font-medium text-indigo-200">Subscription Plan</p>
                  <h2 className="mt-1 text-lg font-bold">Professional</h2>
                  <p className="mt-1 text-xs text-indigo-200">90 meals/month · 5 locations · Full analytics</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-extrabold">$299<span className="text-sm font-normal text-indigo-300">/mo</span></p>
                      <p className="mt-0.5 text-[11px] text-indigo-300">Next billing: Jul 1, 2026</p>
                    </div>
                    <button type="button" className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors">
                      Upgrade
                    </button>
                  </div>
                </SlideIn>

                {/* Storage */}
                <SlideIn from="right" delay={0.04} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold text-slate-900">Storage Usage</h2>
                  <div className="relative flex items-center justify-center">
                    <div className="h-36 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={STORAGE_DATA} cx="50%" cy="50%" innerRadius={44} outerRadius={66} dataKey="value" startAngle={90} endAngle={-270}>
                            {STORAGE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-bold text-slate-900">62%</p>
                        <p className="text-[10px] text-slate-400">Used</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-indigo-600" />Used</span>
                      <span className="font-semibold text-slate-900">6.2 GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-200" />Free</span>
                      <span className="font-semibold text-slate-900">3.8 GB</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5">
                      <span className="font-medium text-slate-500">Total</span>
                      <span className="font-bold text-slate-900">10 GB</span>
                    </div>
                  </div>
                </SlideIn>

                {/* System info */}
                <SlideIn from="right" delay={0.08} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold text-slate-900">System Information</h2>
                  <div className="flex flex-col gap-2 text-xs">
                    {[
                      { label: "Version",       val: "v4.2.1" },
                      { label: "Last Updated",  val: "Jun 20, 2026" },
                      { label: "Environment",   val: "Production" },
                      { label: "Status",        val: "Operational", highlight: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-slate-500">{item.label}</span>
                        <span className={`font-semibold ${item.highlight ? "text-emerald-600" : "text-slate-900"}`}>
                          {item.highlight && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </SlideIn>
              </div>
            </div>
          )}

          {activeTab === "meal" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SlideUp className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Meal Service Settings</h2>
                <div className="flex flex-col gap-4">
                  <SelectField label="Default Meal Plan" options={["High Protein", "Balanced", "Low Carb", "Vegetarian", "Keto", "Mediterranean"]} defaultValue="Balanced" />
                  <SelectField label="Delivery Frequency" options={["Daily", "3x per week", "5x per week", "Weekly"]} defaultValue="Daily" />
                  <SelectField label="Preferred Delivery Slot" options={["Morning (8–10 AM)", "Midday (12–2 PM)", "Evening (6–8 PM)"]} defaultValue="Morning (8–10 AM)" />
                  <Field label="Default Number of Meals/Day" defaultValue="3" type="number" />
                </div>
              </SlideUp>
              <SlideUp delay={0.04} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">System Settings</h2>
                <ToggleRow label="Enable Auto-Renewal"        desc="Automatically renew subscription each billing cycle." defaultOn />
                <ToggleRow label="Allow Member Plan Changes"  desc="Members can switch their assigned meal plan."         defaultOn />
                <ToggleRow label="Enable Delivery Tracking"   desc="Real-time GPS delivery tracking for all orders."     defaultOn />
                <ToggleRow label="Enable Quality Feedback"    desc="Prompt members to rate meals after delivery."        defaultOn />
                <ToggleRow label="Enable Maintenance Mode"    desc="Put the service in read-only maintenance mode." />
              </SlideUp>

              {/* Weekly Default Plans — spans both columns */}
              <SlideUp delay={0.08} className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Weekly Default Plans</h2>
                </div>
                <p className="mb-4 text-[11px] text-slate-400 leading-relaxed">
                  Choose the default meal plan for each day of the week. These values are used to
                  pre-fill the <span className="font-medium text-slate-600">Plan</span> column when
                  downloading the planner CSV template.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {WEEK_DAYS.map(day => (
                    <div key={day} className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 text-center">{day}</label>
                      <div className="relative">
                        <select
                          value={dayPlans[day]}
                          onChange={e => setDayPlans(prev => ({ ...prev, [day]: e.target.value }))}
                          className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-7"
                        >
                          {PLAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-slate-400">
                  Changes take effect the next time you download the template from the Planner page. Click <span className="font-medium">Save Changes</span> to persist.
                </p>
              </SlideUp>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SlideUp className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Payment Configuration</h2>
                <div className="flex flex-col gap-4">
                  <SelectField label="Default Currency" options={["BDT (৳)", "USD ($)", "GBP (£)", "EUR (€)", "SAR (ر.س)"]} defaultValue="BDT (৳)" />
                  <SelectField label="Payment Gateway" options={["Stripe", "PayPal", "Square", "Braintree"]} defaultValue="Stripe" />
                  <SelectField label="Billing Cycle" options={["Monthly", "Quarterly", "Annually"]} defaultValue="Monthly" />
                  <Field label="Tax Rate (%)" defaultValue="8.5" type="number" />
                </div>
              </SlideUp>
              <SlideUp delay={0.04} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Payment Policies</h2>
                <ToggleRow label="Auto-charge on Due Date"    desc="Automatically charge the primary payment method."    defaultOn />
                <ToggleRow label="Send Payment Reminders"     desc="Email reminders 7 and 3 days before due date."      defaultOn />
                <ToggleRow label="Allow Partial Payments"     desc="Accept partial payments on outstanding invoices." />
                <ToggleRow label="Enable Refunds"             desc="Allow admins to issue full or partial refunds."     defaultOn />
                <ToggleRow label="Late Payment Penalties"     desc="Apply a fee for payments past the grace period." />
              </SlideUp>
            </div>
          )}

          {activeTab === "notification" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SlideUp className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Email &amp; Push Notifications</h2>
                <ToggleRow label="Order Status Updates"       desc="Get notified when an order status changes."         defaultOn />
                <ToggleRow label="Delivery Alerts"            desc="Real-time alerts when delivery is nearby."          defaultOn />
                <ToggleRow label="Meal Plan Reminders"        desc="Daily reminders about today's meal schedule."       defaultOn />
                <ToggleRow label="Promotional Emails"         desc="New plans, seasonal menus, and special offers." />
                <ToggleRow label="Weekly Nutrition Summary"   desc="A weekly digest of nutrition progress."             defaultOn />
                <ToggleRow label="Invoice &amp; Billing Alerts" desc="Notifications for upcoming bills and payments."   defaultOn />
              </SlideUp>
              <SlideUp delay={0.04} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Channel Preferences</h2>
                <div className="flex flex-col gap-4">
                  <SelectField label="Primary Channel" options={["Email", "SMS", "Push Notification", "All Channels"]} defaultValue="Email" />
                  <Field label="Notification Email" defaultValue="admin@nutracorp.test" type="email" />
                  <Field label="SMS Number" defaultValue="+1 (800) 123-4567" type="tel" />
                  <SelectField label="Quiet Hours" options={["None", "10 PM – 8 AM", "11 PM – 7 AM", "Midnight – 7 AM"]} defaultValue="10 PM – 8 AM" />
                </div>
              </SlideUp>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SlideUp className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Regional Preferences</h2>
                <div className="flex flex-col gap-4">
                  <SelectField label="Language" options={["English (US)", "English (UK)", "Arabic", "French", "Spanish"]} defaultValue="English (US)" />
                  <SelectField label="Timezone" options={["UTC+0", "UTC+3 (AST)", "UTC+5:30 (IST)", "UTC-5 (EST)", "UTC-8 (PST)"]} defaultValue="UTC-5 (EST)" />
                  <SelectField label="Currency Display" options={["BDT (৳)", "USD ($)", "GBP (£)", "EUR (€)"]} defaultValue="BDT (৳)" />
                  <SelectField label="Date Format" options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]} defaultValue="MM/DD/YYYY" />
                </div>
              </SlideUp>
              <SlideUp delay={0.04} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Display &amp; Appearance</h2>
                <ToggleRow label="Dark Mode"                  desc="Switch to a dark colour scheme." />
                <ToggleRow label="Compact View"               desc="Reduce spacing for a denser layout." />
                <ToggleRow label="Show Nutrition Totals"      desc="Always show daily nutrition totals."              defaultOn />
                <ToggleRow label="Enable Animations"          desc="Use motion animations for transitions."           defaultOn />
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <SelectField label="Font Size" options={["Small", "Default", "Large"]} defaultValue="Default" />
                </div>
              </SlideUp>
            </div>
          )}

          {activeTab === "integrations" && (
            <SlideUp className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Stripe",       desc: "Payment processing and subscription billing.", status: "connected", icon: "💳" },
                { name: "Mailchimp",    desc: "Email marketing and newsletter campaigns.",     status: "connected", icon: "📧" },
                { name: "Google Maps",  desc: "Delivery tracking and route optimization.",     status: "connected", icon: "🗺️" },
                { name: "Slack",        desc: "Team notifications and order alerts.",           status: "disconnected", icon: "💬" },
                { name: "QuickBooks",   desc: "Accounting and financial reporting sync.",       status: "disconnected", icon: "📊" },
                { name: "Zapier",       desc: "Automate workflows with 3,000+ apps.",          status: "disconnected", icon: "⚡" },
              ].map((int, i) => (
                <motion.div
                  key={int.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{int.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${int.status === "connected" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                        {int.status === "connected" ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">{int.desc}</p>
                  <button
                    type="button"
                    className={`mt-3 w-full rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      int.status === "connected"
                        ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    {int.status === "connected" ? "Disconnect" : "Connect"}
                  </button>
                </motion.div>
              ))}
            </SlideUp>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

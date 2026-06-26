"use client";

import { useState } from "react";
import { Bell, Lock, Globe, Palette, ChevronDown, Save } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Icon className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-4">{children}</div>}
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn = false }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-900">{label}</p>
        {desc && <p className="mt-0.5 text-[11px] text-slate-400">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => setOn(v => !v)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Configure notifications, security, display, and regional preferences.</p>
        </div>
        <Button size="sm" icon={Save}>Save Changes</Button>
      </FadeIn>

      <SlideUp className="flex flex-col gap-4">
        <Section icon={Bell} title="Notifications">
          <ToggleRow label="Order Status Updates"         desc="Get notified when your order status changes."          defaultOn />
          <ToggleRow label="Delivery Alerts"              desc="Real-time push alerts when your delivery is nearby."   defaultOn />
          <ToggleRow label="Meal Plan Reminders"          desc="Daily reminders about today's meal schedule."          defaultOn />
          <ToggleRow label="Promotional Emails"           desc="Receive emails about new plans and special offers."                />
          <ToggleRow label="Weekly Nutrition Summary"     desc="A weekly digest of your nutrition progress."           defaultOn />
        </Section>

        <Section icon={Lock} title="Security & Privacy">
          <ToggleRow label="Two-Factor Authentication"    desc="Require MFA on every login for added security."        defaultOn />
          <ToggleRow label="Login Activity Notifications" desc="Be notified of new sign-ins to your account."         defaultOn />
          <ToggleRow label="Share Nutrition Data"         desc="Allow admins to view your aggregated nutrition stats." defaultOn />
          <ToggleRow label="Data Export Requests"         desc="Allow exporting your personal meal data."              defaultOn />
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button type="button" className="text-xs font-medium text-red-500 hover:underline">Change Password</button>
          </div>
        </Section>

        <Section icon={Globe} title="Regional Preferences">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Language</label>
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["English (US)", "English (UK)", "Arabic", "French"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Timezone</label>
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["UTC+0", "UTC+3 (AST)", "UTC+5:30 (IST)", "UTC-5 (EST)"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Currency</label>
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["USD ($)", "GBP (£)", "EUR (€)", "SAR (ر.س)"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Date Format</label>
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section icon={Palette} title="Display & Appearance">
          <ToggleRow label="Dark Mode"                    desc="Switch to a dark colour scheme across the dashboard."              />
          <ToggleRow label="Compact View"                 desc="Reduce spacing for a denser information layout."                   />
          <ToggleRow label="Show Nutrition Totals"        desc="Always show daily nutrition totals in the header."   defaultOn />
          <ToggleRow label="Enable Animations"            desc="Use motion animations for page transitions."         defaultOn />
          <div className="mt-3 grid grid-cols-1 gap-4 pt-3 border-t border-slate-100 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Accent Colour</label>
              <div className="flex items-center gap-2">
                {["bg-indigo-600", "bg-emerald-600", "bg-violet-600", "bg-rose-600", "bg-sky-600"].map(c => (
                  <button key={c} type="button" className={`h-6 w-6 rounded-full border-2 border-white shadow ${c} focus:outline-none focus:ring-2 focus:ring-indigo-400`} />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Font Size</label>
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["Small", "Default", "Large"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Section>
      </SlideUp>
    </div>
  );
}

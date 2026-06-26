"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Clock, KeyRound, Mail, Shield, User, UserRound } from "lucide-react";
import { MemberCard } from "@/components/member/ui";
import { Banner, Button, Badge, StatusBadge } from "@/components/ui";

const NOTIF_DEFAULTS = [
  { label:"Security alerts",          desc:"Login from new device, blocked attempts",   on:true  },
  { label:"Session expiry warnings",  desc:"30 min before idle timeout",                on:true  },
  { label:"New application assigned", desc:"When admin grants you app access",          on:true  },
  { label:"Policy change notices",    desc:"When your ABAC policies are updated",       on:false },
  { label:"Weekly activity digest",   desc:"Summary of logins and access activity",     on:false },
];

function NotificationPreferences() {
  const [prefs, setPrefs] = useState(() => NOTIF_DEFAULTS.map(n => ({ ...n })));
  function toggle(i: number) { setPrefs(prev => prev.map((p, idx) => idx === i ? { ...p, on: !p.on } : p)); }

  return (
    <MemberCard title="Notification Preferences" className="mt-4">
      <div className="flex flex-col gap-3">
        {prefs.map(({ label, desc, on }, i) => (
          <div key={label} className={`flex items-center justify-between gap-3 ${i < prefs.length - 1 ? "pb-3 border-b border-slate-100" : ""}`}>
            <div>
              <p className="text-xs font-semibold text-slate-800">{label}</p>
              <p className="text-[11px] text-slate-400">{desc}</p>
            </div>
            <button type="button" onClick={() => toggle(i)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${on ? "bg-indigo-600" : "bg-slate-300"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </MemberCard>
  );
}

export default function MemberProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: "John Doe",
    email:       "john.doe@apple.test",
    department:  "Engineering",
    jobTitle:    "Senior Software Engineer",
    timezone:    "America/New_York",
    phone:       "+1 (555) 000-0001",
  });
  const [draft, setDraft] = useState({ ...form });

  function save() { setForm({ ...draft }); setEditing(false); }

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — My Profile. Auth gate disabled for local dev.
      </Banner>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <MemberCard title="Account Identity">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                {form.displayName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-900">{form.displayName}</p>
                <p className="text-xs text-slate-500">{form.jobTitle}</p>
                <p className="text-xs text-slate-400">{form.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="violet" size="xs">MEMBER</Badge>
                <StatusBadge status="active" dot />
              </div>
            </div>
          </MemberCard>

          <MemberCard title="Account Details">
            {[
              { icon:Building2,    label:"Tenant",        value:"Apple Corp"           },
              { icon:Shield,       label:"Role",           value:"MEMBER"               },
              { icon:KeyRound,     label:"Clearance",      value:"Level 2 — Restricted" },
              { icon:CheckCircle2, label:"Email Verified", value:"Yes"                  },
              { icon:Clock,        label:"Member Since",   value:"Jan 12, 2026"         },
              { icon:Clock,        label:"Last Login",     value:"Today 14:30"          },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="mb-3 flex items-center gap-3 last:mb-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-xs font-semibold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </MemberCard>
        </div>

        <div className="lg:col-span-2">
          <MemberCard
            title="Personal Information"
            footer={
              <div className="flex justify-end gap-2">
                {editing ? (
                  <>
                    <Button variant="secondary" onClick={() => { setDraft({ ...form }); setEditing(false); }}>Cancel</Button>
                    <Button onClick={save}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                )}
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { key:"displayName" as const, label:"Display Name",  icon:UserRound, type:"text"  },
                { key:"email"       as const, label:"Email Address", icon:Mail,      type:"email", disabled:true },
                { key:"department"  as const, label:"Department",    icon:Building2, type:"text"  },
                { key:"jobTitle"    as const, label:"Job Title",     icon:User,      type:"text"  },
                { key:"phone"       as const, label:"Phone Number",  icon:UserRound, type:"tel"   },
                { key:"timezone"    as const, label:"Timezone",      icon:Clock,     type:"text"  },
              ].map(({ key, label, icon: Icon, type, disabled }) => (
                <div key={key}>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.8} />
                    {label}
                    {disabled && <span className="text-[10px] text-slate-400">(read-only)</span>}
                  </label>
                  <input
                    type={type}
                    value={editing ? draft[key] : form[key]}
                    disabled={!editing || disabled}
                    onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              ))}
            </div>
          </MemberCard>

          <NotificationPreferences />
        </div>
      </div>
    </div>
  );
}

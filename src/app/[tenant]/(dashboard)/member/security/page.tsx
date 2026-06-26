"use client";

import { useState } from "react";
import {
  CheckCircle2, Eye, EyeOff, Fingerprint, KeyRound, LogIn, LogOut,
  MonitorSmartphone, ShieldAlert, ShieldCheck,
} from "lucide-react";
import { MemberCard, MemberStatCard, ActivityItem } from "@/components/member/ui";
import { Banner, Button, Badge, Tabs } from "@/components/ui";

const TAB_LIST = ["Overview", "MFA Setup", "Login History"] as const;
type Tab = (typeof TAB_LIST)[number];

const LOGIN_HISTORY = [
  { icon:LogIn,      iconBg:"bg-emerald-50", iconColor:"text-emerald-600", title:"Successful login",      description:"Chrome · macOS · 192.168.1.10 · New York, US",  time:"Today 14:30" },
  { icon:LogIn,      iconBg:"bg-emerald-50", iconColor:"text-emerald-600", title:"Successful login",      description:"Safari · iOS · 192.168.1.11 · New York, US",    time:"Today 09:10" },
  { icon:ShieldAlert,iconBg:"bg-red-50",     iconColor:"text-red-600",     title:"Blocked login attempt", description:"Unknown IP · 91.240.20.43 · RU · auto-blocked",  time:"Jun 21" },
  { icon:LogIn,      iconBg:"bg-emerald-50", iconColor:"text-emerald-600", title:"Successful login",      description:"Edge · Windows 11 · 10.0.0.45 · Chicago, US",   time:"Jun 20 08:00" },
  { icon:LogOut,     iconBg:"bg-orange-50",  iconColor:"text-orange-600",  title:"Session expired",       description:"Idle timeout · iPad Air · Boston, US",           time:"Jun 20 17:55" },
  { icon:LogIn,      iconBg:"bg-emerald-50", iconColor:"text-emerald-600", title:"Successful login",      description:"Safari · iPadOS · 172.16.0.8 · Boston, US",     time:"Jun 20 10:15" },
];

const MFA_METHODS = [
  { id:"totp",  label:"Authenticator App (TOTP)", desc:"Google Authenticator / Authy", enrolled:true  },
  { id:"sms",   label:"SMS One-Time Code",         desc:"+1 •••• •• 47",               enrolled:true  },
  { id:"email", label:"Email Code",                desc:"j•••@apple.test",             enrolled:false },
  { id:"hwkey", label:"Hardware Security Key",     desc:"YubiKey / FIDO2",             enrolled:false },
];

export default function MemberSecurityPage() {
  const [tab,          setTab]         = useState<Tab>("Overview");
  const [showPwFields, setShowPwFields] = useState(false);
  const [showPw,       setShowPw]       = useState(false);
  const [methods,      setMethods]      = useState(MFA_METHODS);

  function toggleMethod(id: string) {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enrolled: !m.enrolled } : m));
  }

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — MFA & Security. Auth gate disabled for local dev.
      </Banner>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">MFA & Security</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage your authentication methods and account security.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemberStatCard icon={ShieldCheck}       value="Strong" label="Security Score"   sub="All recommended steps done"  />
        <MemberStatCard icon={Fingerprint}       value={2}      label="MFA Methods"      sub="Enrolled"                    iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <MemberStatCard icon={MonitorSmartphone} value={2}      label="Active Sessions"  sub="Across devices"              iconBg="bg-indigo-50"  iconColor="text-indigo-600" />
        <MemberStatCard icon={ShieldAlert}       value={1}      label="Blocked Attempts" sub="In the last 30 days"         iconBg="bg-red-50"     iconColor="text-red-600" />
      </div>

      <Tabs
        tabs={TAB_LIST.map(t => ({ key: t, label: t }))}
        activeKey={tab}
        onChange={v => setTab(v as Tab)}
      />

      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MemberCard title="Multi-Factor Authentication">
            <div className="flex flex-col gap-3">
              {methods.map((m, i) => (
                <div key={m.id} className={`flex items-center justify-between gap-3 ${i < methods.length - 1 ? "pb-3 border-b border-slate-100" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.enrolled ? "bg-emerald-50" : "bg-slate-100"}`}>
                      <Fingerprint className={`h-4 w-4 ${m.enrolled ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{m.label}</p>
                      <p className="text-[11px] text-slate-400">{m.desc}</p>
                    </div>
                  </div>
                  <Badge variant={m.enrolled ? "success" : "muted"} size="xs">
                    {m.enrolled ? "Enrolled" : "Not set up"}
                  </Badge>
                </div>
              ))}
            </div>
          </MemberCard>

          <MemberCard title="Password & Account">
            <div className="flex flex-col gap-3">
              {[
                { icon:KeyRound,        label:"Last Password Change", value:"Jun 23, 2026 · 2 days ago" },
                { icon:CheckCircle2,    label:"Account Status",       value:"Active · Verified email"   },
                { icon:MonitorSmartphone,label:"Active Sessions",     value:"2 devices signed in"        },
                { icon:ShieldAlert,     label:"Blocked Attempts",     value:"1 in the last 30 days"      },
              ].map(({ icon: Icon, label, value }, i, arr) => (
                <div key={label} className={`flex items-center gap-3 ${i < arr.length - 1 ? "pb-3 border-b border-slate-100" : ""}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-400">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowPwFields(p => !p)}>
                {showPwFields ? "Cancel" : "Change Password"}
              </Button>
              {showPwFields && (
                <div className="mt-3 flex flex-col gap-2">
                  {["Current Password", "New Password", "Confirm New Password"].map(label => (
                    <div key={label} className="relative">
                      <input type={showPw ? "text" : "password"} placeholder={label}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-9 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200" />
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                  <Button fullWidth className="mt-1">Update Password</Button>
                </div>
              )}
            </div>
          </MemberCard>
        </div>
      )}

      {tab === "MFA Setup" && (
        <MemberCard title="Manage MFA Methods">
          <div className="flex flex-col gap-3">
            {methods.map((m, i) => (
              <div key={m.id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${m.enrolled ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"} ${i < methods.length - 1 ? "mb-1" : ""}`}>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </div>
                <button type="button" onClick={() => toggleMethod(m.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${m.enrolled ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${m.enrolled ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </MemberCard>
      )}

      {tab === "Login History" && (
        <MemberCard title="Login History · Last 30 Days">
          <div className="flex flex-col gap-3">
            {LOGIN_HISTORY.map((item, i) => (
              <ActivityItem key={i} {...item} last={i === LOGIN_HISTORY.length - 1} />
            ))}
          </div>
        </MemberCard>
      )}
    </div>
  );
}

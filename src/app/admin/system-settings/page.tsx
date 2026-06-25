"use client";

import { useState } from "react";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import { AdminFooter, PageHeader, PreviewBanner } from "@/components/platform-admin/ui";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Database,
  ExternalLink,
  Fingerprint,
  Globe,
  HardDrive,
  Key,
  Layers,
  Layout,
  Lock,
  Mail,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Sliders,
  Wrench,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingCategory {
  id: string; title: string; description: string; count: number;
  icon: React.ElementType; iconBg: string; iconColor: string;
  badge?: string;
}

interface RecentChange {
  id: string; setting: string; changedBy: string; date: string; change: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SETTING_CATEGORIES: SettingCategory[] = [
  { id:"general",       title:"General Settings",          description:"Platform name, domain, default language, and regional preferences.",        count:5,  icon:Globe,        iconBg:"bg-blue-50",     iconColor:"text-blue-600"    },
  { id:"auth",          title:"Authentication Settings",   description:"Login methods, session policies, and admin password rules.",                 count:4,  icon:Lock,         iconBg:"bg-green-50",    iconColor:"text-green-600"   },
  { id:"tenant",        title:"Tenant Settings",           description:"New tenant defaults, onboarding flow, and provisioning policies.",           count:3,  icon:Building2,    iconBg:"bg-violet-50",   iconColor:"text-violet-600"  },
  { id:"email",         title:"Email Settings",            description:"SMTP server, sender address, and email notification templates.",             count:6,  icon:Mail,         iconBg:"bg-orange-50",   iconColor:"text-orange-600"  },
  { id:"notifications", title:"Notification Settings",     description:"System-wide alerts, webhooks, and admin notification channels.",             count:3,  icon:Bell,         iconBg:"bg-emerald-50",  iconColor:"text-emerald-600" },
  { id:"security",      title:"Security Settings",         description:"IP allowlisting, brute-force protection, and admin 2FA requirements.",       count:5,  icon:Shield,       iconBg:"bg-red-50",      iconColor:"text-red-600"     },
  { id:"api",           title:"API & Rate Limiting",       description:"API keys, throttling limits, and developer portal settings.",                count:7,  icon:Code2,        iconBg:"bg-slate-100",   iconColor:"text-slate-700",  badge:"7 settings" },
  { id:"data",          title:"Data & Retention Settings", description:"Log retention periods, export policies, and data purge schedules.",          count:5,  icon:Database,     iconBg:"bg-blue-50",     iconColor:"text-blue-600"    },
  { id:"compliance",    title:"Compliance Settings",       description:"Compliance frameworks, data governance, and regulatory reporting.",           count:3,  icon:CheckCircle2, iconBg:"bg-green-50",    iconColor:"text-green-600"   },
  { id:"branding",      title:"Branding & Customisation",  description:"Logo, colour scheme, and tenant-facing portal customisation.",               count:3,  icon:Layout,       iconBg:"bg-pink-50",     iconColor:"text-pink-600"    },
  { id:"features",      title:"Feature Management",        description:"Enable or disable platform-wide feature flags and beta features.",            count:3,  icon:Zap,          iconBg:"bg-amber-50",    iconColor:"text-amber-600"   },
  { id:"maintenance",   title:"Maintenance Settings",      description:"Maintenance windows, system backups, and downtime alert configuration.",      count:3,  icon:Wrench,       iconBg:"bg-gray-100",    iconColor:"text-gray-600"    },
];

const RECENT_CHANGES: RecentChange[] = [
  { id:"rc1", setting:"Security Settings",         changedBy:"admin@nutratenant.test",    date:"Jun 25, 2026 · 14:30", change:"Enabled brute-force lockout after 5 attempts."               },
  { id:"rc2", setting:"Email Settings",            changedBy:"admin@nutratenant.test",    date:"Jun 25, 2026 · 11:00", change:"Updated SMTP sender address to noreply@nutratenant.com."     },
  { id:"rc3", setting:"API & Rate Limiting",       changedBy:"admin@nutratenant.test",    date:"Jun 24, 2026 · 15:45", change:"Reduced tenant API rate limit to 200 req/min."               },
  { id:"rc4", setting:"Compliance Settings",       changedBy:"admin@nutratenant.test",    date:"Jun 24, 2026 · 10:20", change:"Enabled GDPR data export for all Enterprise tenants."        },
  { id:"rc5", setting:"Feature Management",        changedBy:"admin@nutratenant.test",    date:"Jun 23, 2026 · 16:00", change:"Toggled on AI Policy Review for Enterprise tier."            },
];

// ─── Inline settings panel ────────────────────────────────────────────────────

const INLINE_SETTINGS: Record<string, { label: string; enabled: boolean; desc: string }[]> = {
  general:       [{ label:"Platform Name",          enabled:true,  desc:"NutraTenant"                   },{ label:"Default Language",        enabled:true,  desc:"English (US)"                 },{ label:"Regional Date Format",    enabled:true,  desc:"MM/DD/YYYY"                    },{ label:"Public Landing Page",     enabled:true,  desc:"Enabled"                       },{ label:"Maintenance Mode",        enabled:false, desc:"Off"                           }],
  auth:          [{ label:"Email + Password Login",  enabled:true,  desc:"Active"                        },{ label:"SSO / SAML 2.0",           enabled:true,  desc:"Active"                        },{ label:"Magic Link Login",         enabled:false, desc:"Disabled"                      },{ label:"Admin 2FA Enforcement",   enabled:true,  desc:"Required for SUPER_ADMIN"      }],
  tenant:        [{ label:"Auto-Provision on Signup",enabled:false, desc:"Manual approval required"      },{ label:"Default Plan",             enabled:true,  desc:"Starter"                       },{ label:"Onboarding Email Sequence",enabled:true,  desc:"3-step sequence active"        }],
  email:         [{ label:"SMTP Host",               enabled:true,  desc:"smtp.nutratenant.com"          },{ label:"Sender Address",           enabled:true,  desc:"noreply@nutratenant.com"       },{ label:"Reply-To",                enabled:true,  desc:"support@nutratenant.com"       },{ label:"Welcome Email",            enabled:true,  desc:"Active"                        },{ label:"Invoice Email",            enabled:true,  desc:"Active"                        },{ label:"Security Alert Email",     enabled:true,  desc:"Active"                        }],
  notifications: [{ label:"Slack Alerts",             enabled:true,  desc:"#platform-alerts"              },{ label:"PagerDuty Escalation",     enabled:true,  desc:"On-call rotation active"       },{ label:"Email Digest",             enabled:false, desc:"Daily summary disabled"        }],
  security:      [{ label:"IP Allowlisting",          enabled:false, desc:"All IPs allowed"               },{ label:"Brute Force Lockout",      enabled:true,  desc:"Lock after 5 attempts"         },{ label:"Admin 2FA",                enabled:true,  desc:"Hardware key required"         },{ label:"Session Timeout",          enabled:true,  desc:"30 minutes idle"               },{ label:"Geo-Restriction",          enabled:false, desc:"Disabled"                      }],
  api:           [{ label:"Developer Portal",         enabled:true,  desc:"docs.nutratenant.com"          },{ label:"API Key Rotation",         enabled:true,  desc:"Every 90 days"                 },{ label:"Rate Limit (tenant)",      enabled:true,  desc:"200 req/min"                   },{ label:"Rate Limit (platform)",    enabled:true,  desc:"10,000 req/min"                },{ label:"Webhook Retry Policy",     enabled:true,  desc:"3 retries, 60s interval"       },{ label:"GraphQL API",              enabled:false, desc:"Disabled (REST only)"          },{ label:"API Deprecation Warnings", enabled:true,  desc:"Active"                        }],
  data:          [{ label:"Audit Log Retention",      enabled:true,  desc:"365 days"                      },{ label:"Data Export",              enabled:true,  desc:"GDPR export active"            },{ label:"Data Purge on Offboard",   enabled:true,  desc:"30-day grace period"           },{ label:"Backup Schedule",          enabled:true,  desc:"Daily at 02:00 UTC"            },{ label:"Cold Storage Archive",     enabled:false, desc:"S3 Glacier disabled"           }],
  compliance:    [{ label:"GDPR Mode",                enabled:true,  desc:"Active for all tenants"        },{ label:"SOC 2 Audit Mode",          enabled:true,  desc:"Active (Enterprise tier)"      },{ label:"HIPAA BAA",                enabled:false, desc:"Not configured"                }],
  branding:      [{ label:"Custom Logo",              enabled:true,  desc:"logo.jpeg active"              },{ label:"Primary Accent Colour",    enabled:true,  desc:"Green #16a34a"                 },{ label:"Custom Domain Support",    enabled:true,  desc:"Verified domains active"       }],
  features:      [{ label:"AI Policy Review",         enabled:true,  desc:"Enterprise tier only"          },{ label:"Beta Analytics",           enabled:false, desc:"Opt-in only"                   },{ label:"Clearance Level System",   enabled:true,  desc:"5-tier model active"           }],
  maintenance:   [{ label:"Maintenance Window",       enabled:false, desc:"None scheduled"                },{ label:"Auto Backup",              enabled:true,  desc:"Daily at 02:00 UTC"            },{ label:"Downtime Alerts",          enabled:true,  desc:"Via Slack + PagerDuty"         }],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SystemSettingsPage() {
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [toggles,  setToggles]      = useState<Record<string, Record<number, boolean>>>(
    Object.fromEntries(Object.entries(INLINE_SETTINGS).map(([k, v]) => [k, Object.fromEntries(v.map((s, i) => [i, s.enabled]))]))
  );

  function toggle(catId: string, idx: number) {
    setToggles((prev) => ({ ...prev, [catId]: { ...prev[catId], [idx]: !prev[catId]?.[idx] } }));
  }

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — System Settings. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="System Settings"
          subtitle="Configure global settings and preferences for the NutraTenant platform."
        />

        <div className="flex gap-6 items-start">
          {/* Settings grid — left 2/3 */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SETTING_CATEGORIES.map((cat) => {
                const Icon        = cat.icon;
                const isExpanded  = expanded === cat.id;
                const catSettings = INLINE_SETTINGS[cat.id] ?? [];
                return (
                  <div key={cat.id} className={`flex flex-col rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${isExpanded ? "border-green-200 ring-1 ring-green-200" : "border-slate-200"}`}>
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => p === cat.id ? null : cat.id)}
                      className="flex items-start gap-3 p-4 text-left"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} ${cat.iconColor}`}>
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-sm leading-tight">{cat.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed line-clamp-2">{cat.description}</p>
                      </div>
                      <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                      <span className="text-[11px] text-slate-400">{cat.count} settings</span>
                      <button type="button" onClick={() => setExpanded((p) => p === cat.id ? null : cat.id)} className="text-[11px] font-medium text-green-600 hover:underline flex items-center gap-0.5">
                        {isExpanded ? "Collapse" : "Edit"} <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Inline expanded settings */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex flex-col gap-2.5">
                          {catSettings.map((s, i) => {
                            const isOn = toggles[cat.id]?.[i] ?? s.enabled;
                            return (
                              <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white border border-slate-100 px-3 py-2 shadow-sm">
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-800 truncate">{s.label}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{isOn ? s.desc : "Disabled"}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggle(cat.id, i)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isOn ? "bg-green-500" : "bg-slate-300"}`}
                                >
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0.5"}`} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <button type="button" className="mt-3 w-full rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">
                          Save {cat.title}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar — system info + quick actions + recent changes */}
          <div className="flex w-72 shrink-0 flex-col gap-4">
            {/* System Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">System Information</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label:"Platform Version", value:"v0.1.0" },
                  { label:"Environment",       value:"Development" },
                  { label:"Last Updated",      value:"Jun 25, 2026" },
                  { label:"Next Maintenance",  value:"None scheduled" },
                  { label:"Active Tenants",    value:"3" },
                  { label:"Total Users",       value:"43" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{label}</span>
                    <span className="text-[11px] font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium text-emerald-700">All systems operational</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label:"Check for Updates",    icon:RefreshCw,  color:"text-green-600",  bg:"hover:bg-green-50"  },
                  { label:"Export Configuration", icon:HardDrive,  color:"text-blue-600",   bg:"hover:bg-blue-50"   },
                  { label:"View Changelog",       icon:BookOpen,   color:"text-violet-600", bg:"hover:bg-violet-50" },
                  { label:"System Diagnostics",   icon:Zap,        color:"text-amber-600",  bg:"hover:bg-amber-50"  },
                  { label:"Reset to Defaults",    icon:AlertTriangle,color:"text-red-600",  bg:"hover:bg-red-50"    },
                ].map(({ label, icon: Icon, color, bg }) => (
                  <button key={label} type="button" className={`flex w-full items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition-colors ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} strokeWidth={2} />
                    {label}
                    <ExternalLink className="ml-auto h-3 w-3 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Changes */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Recent Changes</h3>
              </div>
              <div className="flex flex-col gap-3">
                {RECENT_CHANGES.map((change) => (
                  <div key={change.id} className="border-l-2 border-green-200 pl-3">
                    <p className="text-xs font-semibold text-slate-800">{change.setting}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{change.change}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{change.date}</p>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-green-600 hover:underline">
                View all changes <Settings className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}
